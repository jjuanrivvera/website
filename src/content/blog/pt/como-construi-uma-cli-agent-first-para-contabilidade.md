---
title: 'Como construí uma CLI agent-first para um sistema contábil'
description: 'Construí o alegra-cli em uma semana com Claude Code. A velocidade veio de padrões altos, enforcement no CI e dois comandos: /goal e /code-review.'
pubDate: 2026-06-21
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'go', 'agentes-de-ia', 'cli', 'alegra']
cover: '@assets/blog/covers/agent-first-cli-cover.jpg'
coverAlt: 'Ilustração flat sobre fundo creme: uma janela de terminal no centro, cercada por um loop de duas setas teal no sentido horário. Um ícone de alvo e uma lupa sobre uma lista de verificação ficam sobre o loop, com pequenos glifos de uma fatura e uma moeda por perto, esboçando um ciclo automatizado de construir e revisar.'
lang: 'pt'
translationKey: 'alegra-cli-agent-first'
draft: false
featured: false
---

Construí o `alegra-cli` em uma semana com Claude Code, boa parte em uma única noite: 125 commits e 310 tests. O [Alegra](https://alegra.com) é uma plataforma de contabilidade e faturamento muito usada na América Latina, e a CLI é um cliente de linha de comando para a API dele.

Ele cobre toda a superfície da v1 do Alegra: cerca de 40 recursos (contatos, faturas, itens, pagamentos, impostos, relatórios, e o resto), cada um com um `list / get / create / update / delete` uniforme mais ações próprias do recurso como `invoices void` ou `invoices emit`. Cada list filtra, aceita intervalos de data naturais (`--since last-month`), pagina e conta. Você pode importar e exportar CSV em lote, rodar o fluxo de faturamento eletrônico com stamping idempotente para que a mesma fatura nunca seja emitida duas vezes, e puxar catálogos de referência por país (unidades, tipos de identificação, tipos de imposto) totalmente offline para Colômbia, México, Peru, Costa Rica e mais.

O token mora no keyring do sistema operacional, o núcleo HTTP tem um rate limiter adaptativo e retries conscientes de idempotência, e o autocomplete do shell preenche os IDs reais das suas faturas e contatos enquanto você digita. É agent-first por design: `alegra mcp` expõe toda a árvore de comandos como ferramentas MCP, há um skill instalável para Claude Code, Cursor, Codex e outros, e `alegra agent guard` gera hooks que bloqueiam de forma dura operações irreversíveis como `delete` ou `emit`. Qualquer request pode ser pré-visualizado com `--dry-run`, que imprime o curl exato com o token redigido.

A noite fez funcionar. O que tornou confiável veio depois: validei a CLI inteira contra todo o OpenAPI do Alegra e transformei essa especificação em um requisito duro, então um test de contrato e um guard de spec-drift quebram o CI no momento em que o código e a API documentada não batem. Mesmo tendo saído em uma noite, ele ainda tem que bater com a API documentada a cada commit.

A maior parte rodou como um loop agêntico. Usei `/goal` para definir um alvo em direção ao qual o agente trabalha sozinho, e `/code-review` para encontrar o que ele errou. Defina um alvo, revise o resultado, jogue a revisão no próximo alvo. Em volta desse loop eu mantive a barra de qualidade alta e coloquei os padrões no CI para serem checados a cada commit.

Já escrevi antes sobre [a camada de enforcement](/pt/blog/rapido-e-seguro-com-agentes-de-ia), por que hooks e commits importam quando é um agente que digita. Este post é o caso prático: a arquitetura, os padrões, e esse loop, em um projeto inteiro.

## A arquitetura que tornou a velocidade barata

O `alegra-cli` envolve a API do Alegra. O núcleo é um cliente genérico tipado, `Resource[T]`. Cada recurso (um contato, uma fatura, um produto, um pagamento) são exatamente três arquivos: um tipo de dados, um comando, e zero edições no código compartilhado. O recurso vinte e sete custa tão pouco quanto o primeiro.

Isso mantém o agente rápido sem quebrar coisas. Quando a paginação, a autenticação, as retentativas e a formatação de saída vivem em um só lugar, o agente não consegue introduzir uma variante errada no recurso número vinte e sete. A arquitetura absorve os erros.

A API do Alegra retorna alguns valores em mais de um formato. Alguns IDs chegam como inteiros, outros como strings; alguns campos são um objeto `{id, name}`, às vezes só um número. Uns poucos tipos flexíveis de Go absorvem essas variações antes que cheguem à lógica de negócio, então o agente nunca precisou tratá-las caso a caso.

Desde o dia um a CLI também é um servidor MCP: `alegra mcp` expõe cada comando como ferramenta de agente. Esse foi o objetivo o tempo todo, algo que os agentes pudessem dirigir direto. (Faço o argumento mais amplo de CLIs em vez de MCPs em [outro post](/pt/blog/clis-em-vez-de-mcps).)

## Mantendo a barra alta

A regra com que trabalhei era simples: nunca aceitar um "funciona".

Toda vez que o agente terminava algo, eu perguntava o que ainda estava errado, mandava ele corrigir, e perguntava de novo. Quando uma revisão vinha boa, eu lia como uma lista de buracos para fechar. Então fechava e rodava a revisão de novo. A nota seguinte era mais alta, e eu perguntava de novo.

Soa como coisa de personalidade. Na real é só um ciclo, e a maior parte roda sozinha depois que você monta. As duas próximas seções são o como.

## Enforcement com que o agente não tem como discutir

Os padrões só se sustentam se uma máquina os checa, porque um agente vai te dizer que os tests passam, passando ou não.

Então os padrões viraram barreiras:

- **Barreira de cobertura de 80%** que quebra o CI se cair. A cobertura foi de 39,8% para mais de 80% na primeira semana e ficou lá.
- **golangci-lint** limpo a cada commit, forçado por um hook de pre-commit.
- **Race detector** em Linux, macOS e Windows.
- **Fuzz tests** nos tipos de valor. Acharam um bug de `NaN`/`Inf` em minutos que um teste por exemplos teria deixado passar.
- **Tests de contrato** contra os schemas documentados do Alegra, mais um controle que detecta se o código se desvia da especificação, sem tocar a rede.
- Releases assinados com SBOM, e `govulncheck` no CI.

O agente pode afirmar qualquer coisa. A barreira é no que eu realmente confio, e é o que torna seguro deixar o agente ir rápido.

## /goal: define um alvo e deixa rodar

O `/goal` coloca uma condição de parada na sessão. Eu dou um alvo que consigo verificar (chegar a 80% de cobertura, terminar a issue #22, corrigir todos os achados da última revisão) e o agente segue trabalhando até a condição ser verdadeira. Dentro desse alvo ele toma as próprias decisões: quais tests escrever primeiro, como estruturar os casos limite, quais arquivos tocar.

Isso é o que me deixou iterar sem ficar em cima. Meu trabalho virou definir alvos e revisar resultados. Os alvos precisam ser daqueles que uma máquina consegue confirmar, por isso as barreiras de cima importam tanto. O CI consegue provar "80% de cobertura", então funciona como alvo. "Melhora isso" não dá ao agente nada para mirar.

## /code-review: um painel de revisão quando eu peço

O outro carro-chefe foi o skill `/code-review:code-review`. Ele abre vários agentes em paralelo, cada um caçando uma classe diferente de problema (bugs, guardas removidas, quebras entre arquivos, armadilhas da linguagem), e depois faz eles verificarem de forma adversarial cada achado antes de reportar, então o ruído é filtrado antes de chegar em mim.

Rodei em cada PR que valia a pena. No release de segurança ele se provou: pegou um hook de guarda que falhava _aberto_, um que teria deixado passar um comando destrutivo com certa entrada. Isso teria ido pro ar. Cada revisão alimentava o próximo `/goal`: corrige tudo que achou, não para até estar limpo.

Essas quatro peças se empilham uma sobre a outra. Eu defino o que significa bom, uma máquina checa, o agente trabalha em direção a isso, e uma passada à parte verifica o resultado.

## Segurança desde o começo

A CLI guarda o token da API no keyring do sistema operacional, nunca num arquivo de config. O `--dry-run` imprime o curl exato antes de enviar nada. As exclusões pedem confirmação. Depois adicionei o `alegra agent guard`, que gera hooks PreToolUse que bloqueiam operações irreversíveis no host do agente, antes do comando chegar na CLI. A camada MCP também marca as ferramentas de escrita para que os hosts que as entendem perguntem primeiro.

## Por que foi rápido e ainda assim seguro

Se mover assim tão rápido soa como pular etapas. Não pulei. Cada mudança passou por um PR para o `develop`, o CI tinha que estar verde antes do merge, as tags disparavam o release, e o `main` era promovido limpo. Uma vez o agente fez commit direto no `develop`. Revertí e mandei o trabalho por um PR como todo o resto.

A velocidade veio de três coisas empilhadas: uma arquitetura onde estender é quase de graça, enforcement que tornou seguro se mover, e `/goal` mais `/code-review` para autonomia e verificação. O sistema em volta do modelo é o que produziu o ritmo.

Se você construiu com um agente e o resultado foi mediano, o modelo provavelmente não era o problema. O que importa é quão bem você o dirige e quão fortes são as suas proteções. Essa parte é sua.

---

O `alegra-cli` é MIT e mora em [github.com/jjuanrivvera/alegra-cli](https://github.com/jjuanrivvera/alegra-cli). Instala com Homebrew, Scoop, Docker, ou `go install`. Se você usa o Alegra e trabalha com agentes, é um ponto de partida.
