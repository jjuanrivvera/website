---
title: 'Git Worktrees para Desenvolvimento Paralelo com IA'
description: 'Trocar de branch perde mais que as mudanças sem commit quando há um agente de IA. Ele também perde o contexto de sessão. Os worktrees evitam os dois.'
pubDate: 2026-06-06
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'git', 'worktrees', 'docker', 'workflow']
cover: '@assets/blog/covers/worktree-strategy-cover.jpg'
coverAlt: 'Fotografia cinematográfica de um espaço de trabalho aconchegante em casa: três monitores curvos sobre uma mesa de madeira, cada um exibindo um tema de editor de código diferente (âmbar, turquesa e roxo) que representam três contextos de desenvolvimento paralelos rodando lado a lado'
lang: 'pt'
translationKey: 'worktree-strategy'
draft: false
featured: false
---

Trocar de contexto entre branches sempre foi caro. `git stash`, fazer checkout da branch e subir o ambiente local de novo come entre cinco e quinze minutos. Você perde o fio do raciocínio, os arquivos que estavam abertos ficam desatualizados, e o estado do banco de dados que você estava depurando se foi. O conserto de sempre é ser disciplinado com o stash e manter a árvore de trabalho limpa. Isso funciona bem quando você é o único que segura o contexto.

Com um agente de IA no ciclo, o custo cresce de um jeito que não recebe atenção suficiente. Os agentes de IA para código (Claude Code, Codex, Gemini CLI, OpenCode) constroem um entendimento da sua base de código dentro da sessão. Ao longo de minutos ou horas eles acumulam contexto: quais arquivos importam para a tarefa, o plano que vêm executando pela metade, as invariantes que deduziram de um subsistema, os testes em que aprenderam a confiar. Nada disso está escrito em lugar nenhum. Vive na sessão, ancorado aos arquivos em disco.

Quando o diretório de trabalho muda, uma troca de branch que substitui cada arquivo versionado, o contexto do agente perde sua âncora. Um arquivo que ele vinha lendo continua existindo no mesmo caminho, então nada quebra, mas o código lá dentro pode ter sido reescrito. O plano que o agente estava executando assumia uma versão da base de código que já não está em disco. O mais seguro que o agente pode fazer é reler os arquivos críticos antes de continuar. Isso custa tempo, tokens e atenção. Ficamos bons em deixar os agentes produtivos e esquecemos que a gestão de branches coloca um teto nessa produtividade.

O conserto é mais velho que os agentes. Um git worktree dá a cada branch o seu próprio diretório, e um script de setup leve transforma esse diretório em um ambiente de trabalho no lugar de um checkout pelado. Este post trata das duas metades, e do porquê os comandos de worktree que vêm no Claude Code e no Codex só resolvem a primeira.

## O que é um Worktree

`git worktree` permite ter várias branches do mesmo repositório em checkout, cada uma no seu próprio diretório, sem clonar o repo uma segunda vez. O histórico `.git` por baixo é compartilhado: commits, branches e remotes são um único armazenamento. Os arquivos de trabalho não.

```bash
# Troca de branch tradicional
git stash
git checkout hotfix-branch
# ... trabalho ...
git checkout feature-branch
git stash pop

# Equivalente com worktree
cd project/.worktrees/hotfix-branch/
# ... trabalho ...
cd project/
# a feature branch continua ali, intacta
```

Sem stash. Sem troca. Ambas as branches existem em disco ao mesmo tempo, e dá para trabalhar nas duas em paralelo. O que mais importa para o trabalho com IA: cada branch tem o seu próprio diretório, então cada branch pode hospedar a sua própria sessão de agente, e essa sessão se mantém estável independente do que aconteça no outro diretório.

## A Peça que os Worktrees Nativos Não Resolvem

O Claude Code tem `EnterWorktree`. O Codex consegue criar worktrees. Os dois servem. Eles fazem o passo cru de `git worktree add`. Mas o `git worktree add` puro te dá um diretório com uma branch em checkout. Ele não te dá um ambiente de desenvolvimento funcional.

Pense no que uma branch recém-sacada precisa:

- **Setup de Docker**: portas únicas para que dois worktrees não colidam, um nome de projeto de Compose separado, dependências instaladas.
- **Arquivos de ambiente**: valores de `.env` delimitados ao worktree (URLs de banco de dados, API keys que apontam para a porta local correta).
- **Instalação de dependências**: o que difere entre a branch base e a branch feature pode exigir `npm ci`, `composer install` ou `uv sync`.
- **Contexto do agente de IA**: o CLAUDE.md, as skills, os hooks e as configurações de agente que vivem no diretório principal do projeto. Sem eles, o agente dentro de um worktree se comporta como um recém-contratado no primeiro dia.

As ferramentas nativas de worktree pulam tudo isso. Elas resolvem o problema do _git_ mas não o problema do _ambiente de desenvolvimento_, e para o trabalho prático assistido por IA o problema do ambiente é a parte difícil.

Não é teoria. A skill de worktree no meu workspace principal traz uma nota explicando que o seu passo de vínculo de configuração existe justamente para reparar worktrees criados pelo `EnterWorktree` do Claude Code, que aparecem sem os symlinks de configuração de IA. O builtin cria o diretório. Você ainda precisa torná-lo habitável. Essa lacuna é a razão inteira de existir um wrapper.

Nem todo projeto sofre com isso. Os projetos em Go compilam rápido e quase não têm ambiente de desenvolvimento local pra falar. Um único `go run` e você já está na branch nova. Scripts de infraestrutura, modelos de dbt, mudanças rápidas de SQL: nada disso precisa de ferramentas de worktree. O benefício aparece quando o seu projeto tem um setup local não trivial que leva minutos para reconstruir entre branches.

## Como Eu Resolvo

Tudo o que vem a seguir é o wrapper `wt` que escrevi para os meus próprios projetos. Leia como um exemplo trabalhado, não como uma ferramenta para instalar. O seu stack vai querer uma mistura diferente dessas peças, e o valor está em ver quais peças existem e quando cada uma ganha o seu lugar.

O wrapper faz o que o tipo de projeto precisa e nada que ele não precisa. Um stack pesado em Docker precisa de portas e nomes de Compose. Um projeto em Go quase não precisa de nada. O truque é uma única ferramenta que escala de "fazer tudo" até "não fazer nada" conforme o projeto, então você mantém só um fluxo de trabalho.

### Atribuição de Portas

Os conflitos de portas do Docker são a primeira coisa que quebra quando duas cópias de um projeto rodam na mesma máquina. O wrapper atribui portas de forma determinística:

```text
my-api/                          # main: porta 8000
my-api/.worktrees/FEAT-101/      # worktree: porta 8001
my-api/.worktrees/BUG-204/       # worktree: porta 8002
```

O diretório de trabalho principal mantém a porta padrão do projeto. Cada worktree novo pega a próxima porta livre. Se uma porta já está ocupada por qualquer coisa na máquina, o wrapper a pula e pega a seguinte. Quando um worktree é removido, sua porta volta para o bolo.

Cada worktree também recebe o seu próprio nome de projeto de Docker Compose, derivado do nome da branch:

```bash
COMPOSE_PROJECT_NAME=worktree-bug-204
```

Assim, `docker compose up -d` em dois worktrees produz duas cópias independentes do serviço que nunca colidem em containers nem portas. (Se os dois apontam para o mesmo banco de dados de desenvolvimento compartilhado, essa é uma decisão à parte, não um efeito colateral dos worktrees. Mais sobre isso abaixo.)

### Setup Específico por Tipo de Projeto

As linguagens diferem, então um setup único para todos não funciona. O wrapper detecta o tipo de projeto e roda o bootstrap correto:

- **PHP (Docker Compose)**: define um `APP_PORT` único no `.env`, um `APP_SSL_PORT` correspondente, um `COMPOSE_PROJECT_NAME` higienizado, e remove os bindings de porta fixos do `docker-compose.yml` para que o Compose use os valores do `.env`. As dependências do Composer são instaladas dentro do Docker.
- **Python (Django)**: cria um ambiente virtual novo, instala os requirements, roda as migrações.
- **Python (com uv)**: roda `uv sync`.
- **JavaScript/TypeScript**: roda `pnpm install` (ou `npm ci`).
- **Go**: não precisa de setup. O Go cuida das dependências por módulo.

O wrapper é só um script em shell ou em Go que vive com o projeto. Cada projeto define a sua própria função de setup, e o wrapper despacha conforme uma dica de tipo de projeto.

### Symlinks de Configuração de IA

Os arquivos de contexto do agente são a peça que a maioria dos tutoriais de worktree pula, e são a peça que permite à sessão do worktree se virar sozinha. Um worktree criado com `git worktree add` não tem o `.claude/skills/`, nem o `AGENTS.md`, nem o `.mcp.json`, nem os hooks que tornam o agente eficaz.

Isso importa mais do que parece. Quando o Claude Code ou o Codex criam um worktree para você, o agente que trabalha nele continua sendo a sessão pai. As skills, os agentes, os hooks e a configuração de MCP vivem no diretório de onde você partiu, não no worktree. Então o worktree só serve enquanto essa sessão pai continuar viva. Você não consegue fechá-la e retomar o trabalho mais tarde como uma sessão autocontida dentro do worktree.

Vincular o framework de IA dentro do worktree elimina essa dependência. O wrapper vincula diretórios de skills, configurações de agente, registros de comandos, arquivos de instruções (CLAUDE.md, AGENTS.md) e configurações de servidores MCP em cada worktree no momento da criação. Um arquivo é copiado em vez de vinculado: o arquivo de settings local que carrega os valores específicos da porta. Agora o worktree carrega o seu próprio setup de IA completo. Junto com o seu próprio ambiente de desenvolvimento, você pode abrir uma sessão de agente nova direto no worktree, no seu próprio terminal, e ela tem tudo o que o diretório principal tem. Ela roda de forma independente do pai. Você pode fechar a sessão que o criou, ou manter várias rodando ao mesmo tempo, cada uma a sua própria sessão de longa duração.

O agente não sabe, e não precisa saber, que está em um worktree. Os hooks disparam como sempre, e o pipeline de qualidade também.

### Reciclagem de Portas na Remoção

Quando um worktree é removido, o wrapper para os seus containers de Docker e libera a porta. A próxima criação de worktree vê a porta liberada e pode atribuí-la. Isso mantém o intervalo de portas compacto ao longo de um ciclo de desenvolvimento longo.

Um comando separado de limpeza percorre todos os worktrees, remove aqueles cujas branches já foram mergeadas na `main`, e para os seus containers:

```bash
wt cleanup my-api     # um projeto
wt cleanup            # todos os projetos do workspace
```

Rodando semanalmente, isso evita que os worktrees se acumulem sem tocar no trabalho ativo.

## Ajuste o Setup ao que o Seu Stack Precisa

O mesmo comando `wt create <projeto> <branch>` roda em todos os projetos, mas o que ele _faz_ deveria acompanhar o stack. Cada peça de setup custa, então adicione-a só onde o stack te obriga e os seus worktrees ficam baratos. Dois exemplos marcam o intervalo.

Um projeto em Go quase não precisa de nada. O cache de módulos é global, não há serviços locais para subir, e não há porta para atribuir. A função de setup está vazia. Você ainda obtém o mais importante dos worktrees: uma sessão independente por branch e compilação isolada. Mesmo com setup zero, o mesmo wrapper cuida do projeto, então você não mantém uma segunda ferramenta para o caso fácil.

Uma app moderna de JavaScript fica um degrau acima, e ensina a lição oposta: não escreva maquinário que você não precisa. Uma app baseada em Vite não precisa de nada da lógica de colisão de portas do Docker, porque o servidor de desenvolvimento já escolhe uma porta livre por conta própria. Atribuir portas na mão aqui é esforço gasto brigando com um problema que a ferramenta já resolveu. O que vale a pena é vincular `node_modules` com symlink ao checkout principal para que cada worktree não reinstale centenas de megabytes de dependências.

O extremo pesado é um stack de Docker Compose com vários serviços e portas fixas no arquivo de compose. É aí que o tratamento completo ganha o seu lugar: atribuir uma porta livre, definir um nome de projeto de Compose único, corrigir os bindings de porta fixos, instalar dependências no container. Na mão isso são dez a quinze minutos de setup cuidadoso e propenso a erros toda vez que você começa uma tarefa em paralelo. Automatizado, são alguns segundos.

O mesmo princípio cobre os bancos de dados e qualquer outro serviço compartilhado. Dê ao worktree o seu próprio banco de dados quando o trabalho precisar do isolamento; caso contrário, deixe que ele compartilhe o do pai. Os worktrees isolam arquivos e processos, não estado externo, então isolar esse estado é um passo extra que você dá só quando o trabalho pede. Faça o mínimo que o seu stack exige.

## Como Adaptar ao Seu Caso

O setup específico por projeto é a decisão de design chave. No lugar de um script monolítico que conhece cada tipo de projeto, o wrapper é extensível: adicionar suporte para um stack novo é escrever uma função pequena que cuida do `setup` e do `teardown` para aquele tipo de projeto.

É isso que faz uma única ferramenta cobrir stacks que não se parecem em nada:

- Um time com microsserviços puros em Go não escreve nada. A função de setup vazia é a história inteira.
- Um time com Docker se concentra na lógica de portas e Compose e ignora todo o resto.
- Um time de Django adiciona criação de virtualenv e passos de migração sem tocar na configuração de mais ninguém.

O padrão é: `wt create <projeto> <branch>` faz o trabalho de git, e depois pede à função de setup registrada do projeto que prepare o ambiente. O registro do projeto é um arquivo de configuração, uma linha por projeto.

Então o que você leva não é o meu script. É a divisão: faça o trabalho de git uma vez, e depois passe o controle para um passo de setup por projeto que você escreve para o seu próprio stack. Eu montei o `wt` em torno dos projetos em que me toca trabalhar. Você deveria montar o seu em torno dos seus, com funções de setup para os stacks que você usa e nada para os que você não usa. São algumas centenas de linhas de shell, não um framework. O worktree é a parte universal; o setup sempre vai ser seu.

## Onde os Worktrees Rendem Mais

| Cenário                                                                                                                       | Benefício                                                 |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Stacks pesados em Docker onde o setup local leva minutos (APIs em PHP, portais em Django, apps JS com `node_modules` grandes) | Alto                                                      |
| Projetos em Go, scripts de infraestrutura, mudanças rápidas de uma vez só                                                     | Baixo (mas as sessões de agente em paralelo ainda ajudam) |
| Tickets entre projetos que tocam vários serviços ao mesmo tempo                                                               | Máximo                                                    |

O cenário de maior benefício é um ticket entre projetos que toca uma API em PHP, um frontend em JavaScript e um serviço em Python ao mesmo tempo. Você sobe um worktree em cada um, cada qual nas suas próprias portas e com a sua própria sessão de agente, e se move entre eles trocando de diretório. Nada colide. A alternativa é fazer malabares com três branches e reconstruir três ambientes na mão, algo doloroso o bastante para desanimar o trabalho em paralelo por completo.

Os worktrees tiram esse custo. Cada ticket vive no seu próprio diretório, com o ambiente de Docker e a sessão de agente que precisar bem ao lado. Você fecha um terminal, abre outro, e tudo está onde você deixou. A troca de branch vira uma troca de diretório, e o agente não perde o seu lugar.

Um humano que faz malabares com duas branches paga em concentração. Um agente paga em correção: em silêncio, porque age sobre uma base de código que se moveu por baixo dele. Os worktrees são a forma de parar de fazê-lo pagar.
</content>
</invoke>
