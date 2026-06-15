---
title: 'Engenharia de Contexto em 12 Repositórios'
description: 'Trabalhar com 12 repositórios em stacks diferentes é mais complicado para assistentes de IA do que parece. Esse é o sistema de contexto onde cheguei.'
pubDate: 2026-04-15
author: 'Juan Felipe Rivera González'
tags:
  [
    'claude-code',
    'ia',
    'engenharia-de-contexto',
    'ferramentas-dev',
    'produtividade',
  ]
cover: '@assets/blog/covers/context-engineering-12-repos-cover.jpg'
coverAlt: 'Uma pasta cyan brilhante no centro de uma cena azul escuro, conectada por linhas neon finas a doze nós de repositórios menores orbitando ao redor. Sobre a pasta central, três camadas horizontais empilhadas representam uma hierarquia de contexto, cada uma com um pequeno ícone de arquivo markdown. Símbolos de código tênues flutuam no fundo.'
lang: 'pt'
translationKey: 'context-engineering-12-repos'
draft: false
featured: true
---

Trabalhar com um cliente que tem 12 projetos em stacks diferentes (serviços em PHP, um portal em Django, CLIs em Go, cloud functions em Python, uma camada de JavaScript injetada num LMS) é um problema mais complicado para os assistentes de IA do que parece. Cada repo tem suas próprias convenções, seu próprio setup de testes, seu próprio fluxo de deployment. Ao mesmo tempo, eles compartilham bases de dados, mandam eventos uns para os outros, e estão em cima de uma migração ao vivo de um backend legado para um mais novo. Uma mudança num sistema costuma exigir uma mudança correspondente em outro. Um engenheiro que entra no time não aprende uma base de código. Ele aprende como as bases de código interagem entre si.

Claude Code, Codex, Cursor e Opencode resolvem o problema de "como esse projeto funciona" com arquivos de instruções: CLAUDE.md para o Claude Code, AGENTS.md para os demais, carregados no início de cada sessão. Esse é o ponto de partida da engenharia de contexto: dar ao agente o contexto que ele precisa para resolver a tarefa, e nada além disso.

Um único arquivo de instruções é suficiente quando você só toca num projeto. Ele começa a mostrar rachaduras quando o mesmo engenheiro precisa operar numa organização inteira. Algumas regras valem em todo lugar (como escrever um commit, em qual linter confiar, quais preferências de ferramentas seguir). Algumas valem só para um repo. Colocar tudo num arquivo plano duplica as regras transversais nos 12 repos, ou as deixa de fora. E colocar tudo num arquivo gigante também não é solução. Uma pesquisa da ETH Zurich sobre contexto inflado em agentes mostra que arquivos de instruções superdimensionados aumentam os custos de inferência enquanto reduzem a taxa de sucesso das tarefas. A HumanLayer observou algo mais forte: o system prompt do Claude Code diz ao modelo para ignorar conteúdo do CLAUDE.md que não seja diretamente relevante à tarefa atual. Encher o arquivo não só gasta tokens. Ele compete com as regras que importam.

Então o problema vira: como você dá a um agente o mesmo contexto de onboarding que um engenheiro novo recebe (convenções de toda a empresa, como os sistemas se relacionam, detalhes específicos de cada projeto) sem explodir a janela de contexto nem duplicar conteúdo em cada repo?

A abordagem onde cheguei tem três camadas de arquivos de instruções, um diretório compartilhado `.agents/` com skills e contexto adicional, e uma estratégia de symlinks que funciona em todos os agentes que uso.

## Três Camadas de Instruções

**Global.** Um único arquivo em `~/.claude/CLAUDE.md` que carrega em cada sessão, em cada máquina. Isso é "como eu trabalho" em geral, nada específico de cliente: preferências de ferramentas, convenções de commits, regras de segurança do git, defaults para filtrar output. Se eu trocar de cliente amanhã, esse arquivo vai comigo sem mudanças.

**Workspace.** Um CLAUDE.md na raiz da pasta que contém todos os repos de um cliente. É aqui que acontece a maior parte da mágica, porque é aqui que o agente aprende como a organização funciona:

- Quais repos existem e para que serve cada um. Uma descrição de uma linha por repo para o agente conhecer a superfície.
- Como os dados fluem entre serviços: qual repo produz quais eventos, qual os consome, onde mora cada base de dados, qual serviço é dono de qual domínio.
- Direção da migração ("revise primeiro o backend legado antes de assumir que o feature está na API nova").
- Mapeamento de ambientes (test, beta, prod) e as CLIs que gerenciam cada um.
- Padrões transversais que o time segue: como os tickets são nomeados, como as branches são criadas, como os releases são coordenados.

Um agente trabalhando no portal de Django agora sabe que o produtor de eventos upstream é o LMS em PHP, mesmo que esse fato não esteja escrito em lugar nenhum dentro do repo de Django. A maioria dos setups de arquivo único perde essa camada por completo, e é ela que mais economiza tempo.

**Projeto.** Cada repo tem seu próprio CLAUDE.md com os detalhes que só esse repo precisa: convenções do framework, comandos locais de test que de fato funcionam, gotchas conhecidos, procedimentos de recuperação quando o ambiente quebra.

Três camadas, sem redundância. Cada uma carrega o que as outras duas não carregam.

## O Que Vai Nesses Arquivos

O filtro que eu aplico: se o agente acerta sem que eu fale, a regra não vai no arquivo. Se o agente erra sem o contexto, a regra vai. Todo o resto é ruído.

Regras que passam no filtro:

- "As rotas estão numa tabela de base de dados, não num arquivo de config." O agente nunca adivinharia isso. Ele hardcoda rotas se não for avisado.
- "Use Docker Compose para rodar os tests. PHPUnit puro pula o resolver de tenants." Sem isso, o agente perde tempo debugando erros de tenant.
- "Use pnpm, não npm." Vale para cada projeto JS que eu toco, então mora no nível global.

Regras que não passam no filtro:

- "Esse é um projeto Django 4." O agente lê o `settings.py` e sabe.
- "Os controllers seguem um padrão service-repository." O agente lê `app/` e infere.
- "Usamos PSR-12 para o estilo de código PHP." Um linter aplica isso; o agente não precisa do lembrete.

Esse último aponta para um padrão mais geral: as regras que podem ser aplicadas mecanicamente não deveriam estar nas instruções. Elas deveriam estar num git hook ou num linter. Vou voltar a isso num post futuro, porque a camada de enforcement é um tema por si só.

Os arquivos de contexto deveriam encolher com o tempo, não crescer. O ponto de Martin Fowler se aplica: "o que você talvez tenha tido que colocar no contexto meio ano atrás pode já nem ser necessário." Os modelos melhoram. Apague o que já não vale seus tokens.

## Skills como Contexto Auto-Discoverable

Os arquivos de instruções têm uma limitação estrutural: eles carregam em cada sessão, sem importar do que a sessão se trata. Quanto mais crescem, mais conteúdo irrelevante carrega em cada turno. É por isso que o filtro de cima importa.

Os skills resolvem a outra metade do problema. Um skill é um arquivo markdown com frontmatter YAML no topo descrevendo quando ele deveria ser ativado, e um corpo descrevendo os passos. Diferente dos arquivos de instruções, os skills não carregam todos de uma vez. O agente escaneia as descrições do frontmatter dos skills disponíveis e decide qual carregar conforme a tarefa em mãos. Os skills irrelevantes ficam de fora.

Isso muda o design da engenharia de contexto. Qualquer contexto que só seja relevante para uma tarefa específica (como fazer deploy de um serviço, como rodar uma migração contra um ambiente específico, como construir um curso no LMS, como fazer onboarding de um novo partner no portal) não pertence ao CLAUDE.md sempre-carregado. Ele pertence a um skill, ativado só quando a tarefa combina.

Então uma quantidade surpreendente de conteúdo que as pessoas colocam no CLAUDE.md deveria sair. Procedimentos passo a passo. Runbooks específicos de ambiente. Workflows de várias fases. Qualquer coisa atada a uma tarefa específica pode viver como um skill, fora da sessão até que a tarefa apareça.

Os skills vivem em dois níveis, do mesmo jeito que os arquivos de instruções:

- **Skills pessoais** como automações do Google Workspace, digest diário, ou transcrição de áudio ficam em `~/.claude/skills/`. Disponíveis em qualquer máquina.
- **Skills de organização** como construção de cursos, ferramentas de base de dados, ou scripts de deployment precisam chegar a cada repo dentro do workspace do cliente.

A pergunta vira onde os skills de nível de organização moram fisicamente. Cada ferramenta descobre os skills a partir do seu próprio caminho, então se comprometer com um caminho só deixa os outros de fora. A próxima seção cobre o layout que eu uso para evitar isso.

## A Pasta .agents/ como Fonte da Verdade

O formato onde eu parei: uma única pasta `.agents/` na raiz da organização, com tudo o que é compartilhado embaixo dela.

```
~/Repos/client/
├── CLAUDE.md                   ← instruções de workspace
├── .agents/
│   ├── skills/                 ← procedimentos reutilizáveis (deploy, migrate, onboard)
│   ├── agents/                 ← reviewers especializados (PHP, QA, sistemas)
│   └── docs/                   ← runbooks, postmortems, notas de arquitetura
├── repo-1/
│   ├── CLAUDE.md               ← instruções de projeto
│   └── .claude/skills  → ../.agents/skills
└── repo-2/
    ├── CLAUDE.md
    └── .claude/skills  → ../.agents/skills
```

Cada repo de projeto carrega um symlink `.claude/skills` apontando para `../.agents/skills`. Uma única fonte da verdade, cada repo a consome, um único edit atualiza os 12 projetos na hora.

`.agents/` tem mais do que só skills. É onde mora o contexto compartilhado no nível de organização:

- **Agentes de review especializados** que os sub-agentes podem adotar: um expert em PHP preparado com as convenções de MVC custom, um agente de QA que conhece o framework de tests de cada repo, um reviewer de sistemas que checa dependências cross-project.
- **Runbooks e postmortems**: notas de arquitetura que não cabem no CLAUDE.md de nenhum repo, writeups de incidentes, diagramas de ambiente. O agente pode puxar isso on-demand, do mesmo jeito que faz com os skills, sem gastar tokens em cada sessão.

Para ferramentas que já leem `.agents/` nativamente (Codex, Cursor, Copilot e o resto), nenhum symlink é necessário. Para o Claude Code, o symlink de `.claude/skills` cobre a brecha até que chegue o suporte nativo a `.agents/`. Quando chegar, esses symlinks desaparecem.

O princípio importa mais que o layout exato do diretório: uma única fonte da verdade, consumida por cada ferramenta, sem vendor lock. Apontar um agente novo para a mesma pasta entrega tudo de uma vez.

## Agentes Especializados como Reviewers Paralelos

Uma das subpastas embaixo de `.agents/` guarda agentes de review custom. Cada um é um arquivo markdown que prepara um sub-agente com um foco específico: um expert em PHP sobre as convenções de MVC custom, um especialista em JavaScript sobre a regra de dual-build durante a migração, um reviewer de sistemas sobre dependências cross-project, um agente de QA sobre frameworks de tests.

A especialização importa. Um prompt genérico de "review this code" dá feedback genérico. Um agente preparado com centenas de linhas de convenções do projeto dá feedback que soa como se viesse de alguém que está no projeto há um ano. Eu rodo esses em paralelo durante os reviews. A sessão pai só vê os resumos, então a janela de contexto dela fica leve.

É aqui que a engenharia de contexto deixa de ser "o arquivo que você escreve" e vira "rotear a fatia certa desse contexto para o passo certo da tarefa." Os arquivos de instruções, os skills, e os agentes especializados são todos parte do mesmo sistema de roteamento.

Tudo o que foi descrito acima é um workaround manual. Aguenta bem hoje, e é o que faz 12 repos parecerem um único ambiente de engenharia coerente em vez de 12 desconectados. Um post posterior nesta série vai cobrir a abordagem de plugin que elimina o plumbing manual por completo.
