---
title: 'Convertí mi playbook de CLIs en una fábrica'
description: 'cliwright es un spec más un gate verificable por máquina. Un loop /goal llevó la Bot API de Telegram a un release firmado en dos horas.'
pubDate: 2026-07-03
author: 'Juan Felipe Rivera González'
tags: ['agentes-de-ia', 'cli', 'cliwright', 'golang']
cover: '@assets/blog/covers/cliwright-cli-factory-cover.jpg'
coverAlt: 'Line-art isométrico de alto contraste de una pequeña línea de fábrica sobre fondo blanco hueso: ventanas de terminal avanzan por una banda transportadora a través de una prensa, con un único gate ámbar con un checkmark al final de la línea.'
lang: 'es'
translationKey: 'cliwright-cli-factory'
draft: false
featured: false
---

Sigo construyendo CLIs para las APIs que uso todos los días. Durante un buen tiempo mi método fue pedirle al agente que me construyera otra CLI como la última que hizo, misma arquitectura, mismos estándares. Así creció la familia después de [canvas-cli](https://github.com/jjuanrivvera/canvas-cli): [alegra-cli](/es/blog/como-construi-una-cli-agent-first-para-contabilidad/), después [n8nctl](https://github.com/jjuanrivvera/n8n-cli).

Cada una salió, y cada una me costó días después del build. Las APIs no son iguales. El auth es distinto, la paginación es distinta, el JSON tiene sus propias rarezas, y el agente no conocía el spec de la nueva API ni cuánto de ella cubría la CLI. Así que me la pasaba arreglando cosas que un build "terminado" dejó mal. Y "terminado" seguía siendo lo que el agente afirmara. En el post de alegra escribí que un agente te dice que los tests pasan, pasen o no. Lo mismo con "la CLI está completa".

[cliwright](https://github.com/jjuanrivvera/cliwright) es lo que construí para dejar de hacer eso. Tomé las prácticas que esas CLIs ya compartían y las escribí como un solo playbook que funciona para cualquier API REST, con una definición de terminado que una máquina puede medir. En vez de confiar en lo que recuerda, investiga la API específica a la que lo apuntas: el spec OpenAPI o Swagger cuando existe, la documentación cuando no. Cinco días después del primer commit, un loop `/goal` de fábrica llevó la Bot API de Telegram de cero a un release v0.1.0 firmado en unas dos horas.

## Ni framework, ni loop de agentes

cliwright no genera código por sí mismo y no corre ningún loop propio. Claude Code y Codex ya traen `/goal`, y ese loop es bueno. Lo que un loop necesita para terminar honestamente son dos cosas que no tiene: un spec completo de qué construir, y un gate al que no le pueda hablar bonito.

Esa es toda la herramienta. Un `GOAL.md` de 900 líneas (el spec) más un contrato en el `Makefile` (el gate), distribuidos como plugin de Claude Code y como skill multi-herramienta. Llenas un solo bloque: nombre de la API, URL de la documentación, module path. Todo lo demás es fijo.

Cada lección del spec salió de una de esas CLIs construidas a mano. Canvas obligó a multi-auth: un token personal pegado u OAuth2, detrás de una sola interfaz. Alegra obligó a tipos JSON flexibles para IDs que llegan como string y como número. De n8nctl salieron los perfiles multi-instancia. cliwright es esa experiencia hecha explícita.

## Qué decide el spec

La mayor parte de `GOAL.md` existe para sacar decisiones del loop.

La investigación va primero, y apunta al material de la propia API, no a mí. Modelo de auth, base URL, estilo de paginación, headers de rate limit, rarezas del JSON: son hechos de la API, así que el spec le dice al agente que baje lo que la API publique (un spec OpenAPI o Swagger, un llms.txt, una colección de Postman, el sitio de documentación) y los determine solo. Cuando la documentación es ambigua, declara su supuesto y sigue. Las preguntas que me llegan son las que una búsqueda web no puede responder.

Después, el estándar es fijo. Core genérico tipado, archivos por recurso delgados, tokens en el keyring del sistema, perfiles con nombre, `--dry-run` que imprime el curl con el secreto tapado, salida en tabla/json/yaml/csv, un servidor MCP derivado del árbol de comandos, un `agent guard` que genera hooks del lado del host para comandos destructivos. Nada de eso se re-litiga por proyecto. El spec incluye hasta reglas de determinismo: misma API de entrada, misma CLI de salida.

Es la misma apuesta del core genérico de alegra-cli, un nivel más arriba: el playbook absorbe las diferencias entre APIs.

## El gate es la definición de terminado

La parte que más me importa es la condición de salida. La Definition of Done es una lista de chequeo, y cada ítem atómico está cableado a un script:

```make
verify: check spec-check spec-completeness cover-check   # determinista; CI corre esto
accept: verify judge                                     # el loop /goal se ata a ESTO
```

`spec-check` prueba que cada comando construido mapea a un recurso y verbo declarados. `spec-completeness` es el que atrapa el problema de la memoria: la superficie de la API se enumera desde la documentación en un manifiesto con el conteo de métodos registrado, y el gate falla si el manifiesto cubre menos de un 90% aproximado. Una CLI que cubre una décima parte de la API viéndose perfectamente consistente ya no pasa.

Unos pocos criterios no se prueban con un grep: que los mensajes de error traigan pistas accionables, que el help tenga ejemplos, que los comentarios expliquen el porqué. Esos van a un juez LLM con una rúbrica. El juez cuesta tokens, así que vive en `make accept`, no en el `make verify` que corre CI y cada iteración de desarrollo. Los separé en v0.3.0 después de pagar corridas del juez que un commit de formato no necesitaba.

La última pieza es el anti-trampa: la promesa de completitud del loop solo puede dispararse después de que `make accept` salga en 0. El agente no decide cuándo terminó; la promesa está atada al exit code del gate.

## Lo que salió de la fábrica

Probé la primera versión con una CLI desechable para TheCatAPI, arreglé lo que esa corrida expuso y saqué v0.2.0 el mismo día.

Después, las corridas reales. [tgctl](https://github.com/jjuanrivvera/tgctl), una CLI estilo `gh` para la Bot API de Telegram: primer commit a la 1:48 pm, tag v0.1.0 firmado a las 3:35 pm de esa misma tarde. [lsqueezy](https://github.com/jjuanrivvera/lemon-squeezy-cli), para la API de e-commerce de Lemon Squeezy: primer commit a las 6:34 pm de esa noche, v0.1.0 una hora después. Las dos pasaron el mismo gate que alegra-cli se exige a sí misma: 80% de cobertura en CI, lint y chequeos de vulnerabilidades limpios, servidor MCP, agent guard, auth en keyring, releases firmados con cosign y empaquetados para Homebrew y Scoop.

alegra-cli tomó una semana, la mayor parte en una noche larga. tgctl tomó una tarde, y la pasé revisando, no escribiendo.

Dos advertencias. El paso de review adversarial todavía produce hallazgos donde cerca de la mitad son falsos positivos, así que el pase humano sobrevive: verifica cada hallazgo contra el código antes de actuar, y refutar uno con argumentos citados es un resultado válido. Y las pruebas en vivo contra una instancia real siguen detrás de un opt-in explícito, porque los mocks no ven el comportamiento de la API real pero las escrituras en vivo son irreversibles.

## A dónde va el esfuerzo ahora

Si construyes con agentes, el trabajo que se acumula es escribir tu estándar como spec y convertir tu definición de terminado en un gate que una máquina pueda verificar. Yo lo hice una vez, y ahora cada CLI arranca desde ese estándar y no desde mi memoria de la anterior.

cliwright es MIT y vive en [github.com/jjuanrivvera/cliwright](https://github.com/jjuanrivvera/cliwright). Instálalo como plugin de Claude Code (`/plugin marketplace add jjuanrivvera/cliwright`) o como skill multi-herramienta (`npx skills add jjuanrivvera/cliwright`) y apúntalo a una API que uses.
