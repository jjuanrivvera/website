---
title: 'CLIs em vez de MCPs para integração de ferramentas de IA'
description: 'Servidores MCP guardam credenciais em JSON. CLIs as mantêm no keyring. Depois de seis meses com ambos, movi minhas integrações para fora do MCP.'
pubDate: 2026-04-28
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'mcp', 'cli', 'go', 'security']
cover: '@assets/blog/covers/clis-over-mcps-cover.jpg'
coverAlt: 'Ilustração editorial em painel duplo intitulada MCP vs CLI sobre fundo creme. À esquerda, um trecho de config JSON com um campo PASSWORD exposto e destacado em vermelho, junto a um grupo de ícones de serviços (banco de dados, navegador, tickets, nuvem, chat) cada um marcado com um aviso API_KEY em vermelho, todos emaranhados ao redor de um bloco central MCP SERVER. À direita, um terminal limpo com comandos cf zones list, gh pr view, bw get password, um ícone de keyring com um check verde, e os mesmos serviços organizados em fila conectados limpamente a um único bloco CLI BINARY.'
lang: 'pt'
translationKey: 'clis-over-mcps'
draft: false
featured: false
---

O Model Context Protocol (MCP) é a forma padrão de dar acesso a serviços externos aos assistentes de IA para código. Um MCP de MySQL expõe consultas ao banco de dados. Um MCP de Playwright expõe automação do navegador. Um MCP de Jira expõe operações sobre tickets. O agente descobre as ferramentas, as chama e trabalha.

O padrão é útil. Alguns MCPs acertam: o da Atlassian usa OAuth através de um fluxo de navegador sem segredos no config. Outros trazem salvaguardas embutidas. O MCP de MySQL que eu usava roda por padrão em modo somente leitura e rejeita DDL. Essa restrição soa bem no papel, mas o padrão de armazenamento de credenciais por baixo a torna contornável. Se as credenciais vivem em um JSON que o agente pode ler diretamente, o agente não precisa da função de consulta do MCP para alcançar o banco. Pode ler o config, pegar a senha e se conectar por conta própria.

Depois de seis meses rodando ambos em produção, movi meu trabalho de MySQL e automação de navegador de servidores MCP para CLIs. MySQL passou para um CLI interno em Go que mantenho para o dia a dia com um cliente (também cobre deploys, health checks e gerenciamento de serviços). A automação do navegador passou para playwright-cli. Canvas LMS, onde o agente vinha batendo na API com `curl` cru, passou para canvas-cli pelo mesmo motivo: a auth fica no keyring, não no contexto do agente.

O [post anterior](/blog/ship-fast-and-safe-with-ai-agents) cobriu a camada de enforcement que mantém o comportamento do agente seguro dentro do editor. Hooks, linters, scanners de segredos, allowlists de permissões, portões de conclusão. Este post cobre a camada além disso: como o agente alcança serviços externos, e por que MCPs nem sempre são a melhor opção para esse trabalho.

Uma nota de escopo antes de seguir. Este post assume um agente que pode executar comandos de shell, como Claude Code ou Cursor em modo agente. Se o seu agente não tem acesso a shell (chatbots web, agentes embutidos em UI, a maioria dos assistentes SaaS), MCPs são o caminho certo. Mesmo ali, o padrão abaixo se aplica: construa a funcionalidade como CLI primeiro, e então envelope como MCP quando precisar da superfície do protocolo. A seção "Um binário, duas interfaces" no final mostra como em uma biblioteca Go.

## O que quebra primeiro: as credenciais

Uma configuração típica de um MCP de MySQL:

```json
{
  "mcpServers": {
    "MYSQL_BETA": {
      "command": "npx",
      "args": ["@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "beta-user",
        "MYSQL_PASS": "actual-password-here",
        "MYSQL_DB": "my_database"
      }
    }
  }
}
```

A senha do banco vive em um arquivo JSON. Se o arquivo está na raiz do projeto, basta um `.gitignore` mal configurado para ele ir parar no commit. Mesmo com o `.gitignore` correto, a credencial existe como texto plano em disco, legível por qualquer processo do usuário, inclusive o agente. A segurança que o MCP adiciona por cima (modo somente leitura, tabelas em allowlist, limites de tamanho de query) deixa de ser uma barreira assim que o agente pode abrir o config e usar a credencial diretamente.

Nem todo serviço tem um fluxo OAuth disponível. MySQL, Redis, buckets de armazenamento em nuvem e APIs legadas exigem uma API key ou usuário/senha para autenticar. Quando o serviço precisa de um segredo compartilhado, esse segredo tem que estar em algum lugar que o cliente possa ler. Nos MCPs que eu usava, esse lugar era o arquivo de config do agente. Os serviços que suportam OAuth (o MCP da Atlassian, por exemplo) contornam isso por completo, mas para o resto a credencial vive com a integração e portanto ao alcance do agente.

Eu tinha cinco MCPs de MySQL espalhados em dois projetos. Cada um carregava credenciais em texto plano. Canvas LMS era uma variante do mesmo problema: o agente tinha um personal access token em `.env` e montava as requisições HTTP na mão contra a API do Canvas, o que expõe o token a qualquer shell que leia o arquivo.

## O que um CLI resolve

Um CLI se coloca entre o agente e o serviço. O agente roda comandos e lê saída estruturada. Duas coisas mudam estruturalmente em relação ao setup com MCP:

- **A auth fica fora do contexto.** Os tokens vivem no keyring do sistema. O agente roda `canvas courses list` e nunca vê um token OAuth. O refresh de token, os retries em 401 e os device flows acontecem todos dentro do CLI.
- **O contexto se mantém pequeno.** Os servidores MCP registram seus esquemas de ferramentas com o agente no início da sessão, antes de qualquer trabalho começar. Dez MCPs podem somar dezenas de milhares de tokens de descrições de ferramentas que vivem em contexto durante toda a sessão. O custo em runtime piora isso. O MCP de Playwright foi o caso mais claro no meu setup: quando o agente pedia para inspecionar uma página, ele carregava o HTML completo, o texto visível e a árvore de acessibilidade no contexto primeiro, e filtrava depois. Tarefas simples queimavam quantidades enormes de tokens em conteúdo que o agente não precisava; as complexas perdiam o espaço que o agente precisava para resolver o problema. (Essa é a lacuna que o playwright-cli veio fechar: trazer só o que o agente pede, sob demanda.) Um CLI não adiciona nada até que você o chame; só a saída das chamadas reais entra em contexto. E essa saída é componível: o agente pode passá-la por `jq`, `grep`, `head` ou `awk` para descartar campos e reduzir tamanho antes que qualquer coisa chegue ao contexto. CLIs modernos são construídos com isso em mente, entregando formatos de saída amigáveis para LLMs (JSON estável, modos compactos opcionais, flags concisas, verbosidade opt-in). Com os preços atuais de API e os cortes de rate limits, essa é a diferença entre uma sessão que você pode bancar e uma que não pode.
- **A direção é de mão única.** Um CLI pode ser envolvido como servidor MCP mais tarde (ophis faz isso para CLIs baseados em Cobra com uma única chamada de biblioteca, mostrado adiante). Ir pelo caminho contrário é mais difícil. Servidores MCP rodam dentro do runtime do protocolo. Para transformar um em comando de shell utilizável, você reescreve quase tudo. Construir o CLI primeiro mantém ambas as opções abertas e permite expor a superfície MCP apenas quando um cliente realmente a pedir.

Um CLI bem construído também pode trazer rate limiting, cache, paginação e mensagens de erro mais limpas. MCPs podem trazer as mesmas coisas. As três vantagens acima são as únicas que estão embutidas na forma de cada abordagem.

## O que os LLMs já conhecem

CLIs mainstream já estão nos dados de treino do LLM. `gh`, `gcloud`, `aws`, `kubectl`, `docker`, `git`. Um agente não precisa de um esquema, uma descrição de ferramenta ou um carregador de contexto por sessão para usá-los. Ele sabe as flags e os formatos de saída por padrão.

Isso desloca o tradeoff MCP-vs-CLI. Um MCP de GitHub é o default popular para dar acesso a GitHub ao agente. O CLI `gh` costuma ser a melhor escolha: o agente já o conhece, `gh pr list --json ...` dá saída estruturada limpa, e o token fica em `~/.config/gh/hosts.yml` onde só a shell pode alcançar.

O movimento está acontecendo também no nível de fornecedor. A Cloudflare lançou `cf` em abril de 2026 como technical preview, posicionado explicitamente como o caminho para acesso de agentes de IA à plataforma. O escopo atual é um subconjunto de seus produtos. A meta é cobertura completa (milhares de operações em mais de 100 produtos). O Google Workspace expõe `gws` para a mesma superfície. Fornecedores estão construindo superfícies CLI-first pelas razões que este post levanta.

Para os CLIs que um LLM não conhece (ferramentas internas, CLIs de nichos específicos), a [camada de contexto do post 1](/blog/context-engineering-across-12-repositories) cobre a lacuna. Um arquivo de skill que documente o que o CLI faz e quando usá-lo é suficiente. Skills são auto-descobríveis pelo runtime, então as relevantes carregam apenas quando a tarefa combina. No meu setup, `canvas-cli` e o CLI interno têm cada um um arquivo de skill ao lado do seu código, e o agente os pega automaticamente quando surge uma tarefa de Canvas ou de infra.

## Dois CLIs na prática

### canvas-cli (open source)

[canvas-cli](https://github.com/jjuanrivvera/canvas-cli) é um CLI em Go que eu mantenho para Canvas LMS. Começou como ferramenta pessoal e hoje expõe mais de 280 comandos cobrindo cursos, assignments, módulos, enrollments, submissions e mais.

A auth usa OAuth 2.0 com PKCE e guarda os tokens no keyring do sistema. O suporte multi-instância me permite trocar de ambiente: `canvas --instance production courses list` versus `canvas --instance sandbox courses list`. Os formatos de saída incluem JSON, tabela e CSV. O agente tipicamente usa `--output json` porque é mais fácil de parsear.

Um único binário estaticamente linkado no PATH. Se amanhã eu trocasse de ferramenta de IA, o CLI continuaria funcionando sem mudanças.

### Um CLI interno de cliente com guard rails

Para o meu dia a dia com um cliente também mantenho um CLI em Go que cuida de deploys, consultas ao banco, health checks e gerenciamento de serviços. Não é open source porque é específico daquele ambiente, mas os padrões de segurança se generalizam:

- **`--dry-run`** mostra o que o comando faria sem fazer. O agente roda isso primeiro em qualquer operação destrutiva.
- **`--explain`** descreve a operação em linguagem clara: quais serviços são afetados, em qual ordem as coisas acontecem, o que depende de quê.
- **Somente leitura por padrão.** Consultas ao banco recebem conexões somente leitura a menos que o comando seja explicitamente de escrita. Operações de escrita exigem uma flag `--write` explícita.
- **Timeouts de query e limites de tamanho de resultado.** Um `SELECT *` sem filtro em uma tabela grande falha cedo em vez de devolver um gigabyte para o contexto do agente.

O agente não consegue rodar acidentalmente uma operação destrutiva porque o CLI a rejeita a menos que as flags autorizem. Isso se encaixa diretamente com a allowlist de permissões do [post de enforcement](/blog/ship-fast-and-safe-with-ai-agents). A allowlist consegue dar match em um padrão de comando específico: `Bash(mycli db query --read-only:*)` permitido, qualquer variante com `--write` negada. A estrutura do comando expõe a intenção destrutiva, então a allowlist pode governá-la. Uma chamada de ferramenta MCP esconde essa intenção atrás de um `mysql_query` genérico, então a allowlist tem que permitir ou negar a ferramenta toda. A operação específica lá dentro fica invisível para ela.

## Quando o MCP ganha

Eu não substituí tudo. Dois MCPs ficaram.

**Jira (MCP oficial da Atlassian).** Cobertura funcional decide esse. Meu fluxo de Jira usa worklogs (list, edit, delete, não só add), comentários em formato ADF (bold, multi-parágrafo), busca de contas de usuário, metadata de tipos de issue para criação programática de tickets e busca com Rovo AI. Avaliei tanto o CLI oficial da Atlassian (ACLI) quanto a opção open source mais forte (ankitpokhrel/jira-cli, ~5K estrelas). Em abril de 2026, jira-cli suporta `worklog add` mas não CRUD completo, aceita markdown mas não preserva a estrutura ADF, e não tem busca de usuários nem metadata de campos por tipo de issue. ACLI está evoluindo mas ainda fica curto. O MCP da Atlassian via OAuth cobre tudo: um único fluxo de auth no navegador, ferramentas tipadas sobre toda a superfície da API.

**Context7.** Lookup de documentação viva e atualizada para bibliotecas. O MCP indexa milhares de sites de docs e expõe uma tool de busca que o agente chama quando precisa de references atuais. O equivalente CLI seria um scraper que eu teria que manter; o MCP é a forma certa aqui porque o valor está no índice, não no protocolo.

A regra que uso: quando o CLI cobre o suficiente do que o agente precisa, use. Quando a lacuna é grande o bastante para importar, mantenha o MCP. E quando o MCP expõe algo que o modelo não consegue obter de outra forma (índices externos vivos, APIs completas vendor-specific), o protocolo se paga.

## Escrevendo um CLI pensando em agentes

Alguns padrões que fazem um CLI ser bom para consumo por IA:

- **Saída estruturada por padrão, ou a uma flag de distância.** `--output json` supera parsear layouts de tabela.
- **Uma operação por comando.** `canvas courses list` supera `canvas manage --resource courses --action list`.
- **Espaço de comandos plano.** No máximo dois ou três níveis de aninhamento. Agentes descobrem comandos através de `--help`, então hierarquias profundas desperdiçam tokens.
- **Mensagens de erro estáveis.** Frases como "Course not found" e "Authentication expired" são mais úteis do que códigos de status HTTP.
- **Códigos de saída que signifiquem algo.** Sucesso é 0. Erros de argumento são uma classe, falhas de auth outra, erros de API upstream outra.

Go é uma boa escolha para esse tipo de CLI: binário único estaticamente linkado, cross-compilation, arranque rápido, sem dependências de runtime. Os CLIs que mantenho compilam para macOS (ARM e Intel) e Linux (AMD64) a partir de uma mesma base de código e são entregues copiando o binário.

## Um binário, duas interfaces

O enquadramento CLI-versus-MCP acaba sendo uma falsa escolha. Você pode entregar um binário que se apresenta como ambos.

Uma biblioteca Go chamada [ophis](https://github.com/njayp/ophis) percorre a árvore de comandos do Cobra e converte cada comando em uma ferramenta MCP. Integrá-la no Canvas CLI levou 18 linhas:

```go
rootCmd.AddCommand(ophis.Command(&ophis.Config{
    ToolNamePrefix: "canvas",
    Selectors: []ophis.Selector{{
        LocalFlagSelector: ophis.ExcludeFlags("show-token"),
    }},
}))
```

Isso produziu 253 ferramentas MCP a partir dos mais de 280 comandos do CLI. Flags obrigatórias viraram propriedades obrigatórias do JSON Schema. Opcionais continuaram opcionais. Descrições foram herdadas do texto de ajuda do Cobra. Quando um cliente MCP chama uma ferramenta, o ophis re-invoca o binário com os argumentos reconstruídos. Nenhuma shell envolvida, então nenhum risco de injection.

O binário agora suporta os dois modos:

```bash
# Modo CLI
canvas courses list --instance prod -o json

# Modo MCP
canvas mcp start
```

O CLI mantém suas vantagens: auth no keyring, sem credenciais em contexto, saída estruturada. O modo MCP adiciona discoverability e validação de esquema para clientes que preferem. Mesmo binário, mesmo modelo de segurança, sem duplicação.

Qualquer outro CLI baseado em Cobra pode receber o mesmo tratamento. Se você tem um CLI bem estruturado, expô-lo como MCP é uma chamada de biblioteca, não uma reescrita.

## Para onde isso leva

Comece pelo CLI. Deixe o agente usá-lo nativamente através da shell. Envelope como MCP apenas quando um cliente sem acesso a shell pedir a superfície do protocolo. Um binário, um modelo de segurança, nada duplicado.

A camada de enforcement (hooks, linters, testes) mantém o código escrito por IA seguro dentro do editor. A camada do CLI o mantém seguro fora do editor, em cada serviço que o agente toca. O próximo passo, empacotar tudo isso (arquivos de contexto, hooks, skills, agentes, CLIs) em uma unidade distribuível única, é o post capstone desta série.
