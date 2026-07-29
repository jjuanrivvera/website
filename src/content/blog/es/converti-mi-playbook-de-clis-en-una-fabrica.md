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

Sigo construyendo CLIs para las APIs que uso todos los días. Durante un buen tiempo mi método fue pedirle al agente que construyera la siguiente como la última que hizo, misma arquitectura, mismos estándares. Así fue como a canvas-cli le siguieron [alegra-cli](/es/blog/como-construi-una-cli-agent-first-para-contabilidad/) y después [n8nctl](https://github.com/jjuanrivvera/n8n-cli).

Todas salieron, pero el costo aparecía después del build. Las APIs difieren en auth, en paginación, en la forma del JSON, y el agente no conocía el spec de la nueva API ni cuánto de ella cubría la CLI, así que me pasaba días arreglando cosas que el build dejó mal. Encima, terminado era lo que el agente dijera. En el post de alegra escribí que un agente te dice que los tests pasan, pasen o no, y lo mismo aplica a "la CLI está completa".

Entonces construí [cliwright](https://github.com/jjuanrivvera/cliwright). Tomé las prácticas que esas CLIs ya compartían, las escribí como un playbook que funciona para cualquier API REST, e hice medible la definición de terminado. Investiga cada API por su cuenta, desde el spec OpenAPI o Swagger cuando existe y desde la documentación cuando no, en vez de depender de lo que el modelo recuerda. Cinco días después del primer commit, un loop `/goal` de fábrica llevó la Bot API de Telegram de cero a un release v0.1.0 firmado en unas dos horas.

## Construido sobre /goal

cliwright no genera código y no corre un loop propio. Claude Code y Codex ya traen `/goal`. Lo que le falta a ese loop es un spec completo de qué construir y un gate que decida cuándo el trabajo queda aceptado, así que eso es lo que cliwright aporta: un `GOAL.md` de 900 líneas y un contrato en el `Makefile`, empaquetados como plugin de Claude Code y como skill multi-herramienta. Llenas un solo bloque con el nombre de la API, la URL de la documentación y el module path, y todo lo demás queda fijo.

Las prácticas en sí no son nuevas. La mayoría ya estaba en [canvas-cli](https://github.com/jjuanrivvera/canvas-cli), la primera de la familia: varios métodos de auth detrás de una sola interfaz, tipos JSON flexibles para IDs que llegan como string y como número, perfiles multi-instancia. alegra-cli y n8nctl las reusaron. Lo que faltaba era tener todo eso escrito, para que el estándar no dependiera de que yo lo recordara ni de que el agente lo adivinara.

## Qué decide el spec

La mayor parte de `GOAL.md` saca decisiones del loop.

La investigación va primero, y va al material de la propia API. El modelo de auth, la base URL, el estilo de paginación, los headers de rate limit y las rarezas del JSON son hechos de la API, así que el agente baja lo que la API publique (un spec OpenAPI o Swagger, un llms.txt, una colección de Postman, el sitio de documentación) y los determina solo. Si la documentación es ambigua, declara el supuesto que está haciendo y continúa. Solo me pregunta cosas que una búsqueda web no puede responder.

El estándar también es fijo: un core genérico tipado con archivos por recurso delgados, tokens en el keyring del sistema, perfiles con nombre, un `--dry-run` que imprime el curl con el secreto tapado, salida en tabla/json/yaml/csv, un servidor MCP derivado del árbol de comandos, y un `agent guard` que genera hooks del lado del host para comandos destructivos. También hay reglas de determinismo, para que la misma API produzca la misma CLI.

## El gate es la definición de terminado

La condición de salida me importa más que cualquier otra parte del spec. La Definition of Done es una lista de chequeo, y cada ítem atómico está cableado a un script:

```make
verify: check spec-check spec-completeness cover-check   # determinista; CI corre esto
accept: verify judge                                     # el loop /goal se ata a ESTO
```

`spec-check` prueba que cada comando construido mapea a un recurso y verbo declarados. `spec-completeness` se encarga del problema de la memoria: la superficie de la API se enumera desde la documentación en un manifiesto, el conteo de métodos queda registrado, y el gate falla si el manifiesto cubre menos de un 90% aproximado. Ese chequeo es el que antes no existía, cuando una CLI podía envolver una décima parte de la API y aun así verse consistente.

Algunos criterios no se pueden chequear con un grep, como que los mensajes de error traigan pistas útiles, que el help tenga ejemplos o que los comentarios expliquen el porqué. Esos van a un juez LLM con una rúbrica. El juez cuesta tokens, así que vive en `make accept` y no en el `make verify` que CI corre en cada commit; los separé en v0.3.0 después de pagar corridas del juez que un commit de formato no necesitaba. La promesa de completitud del loop solo puede dispararse después de que `make accept` salga en 0, así que el agente no puede declarar el build terminado por su cuenta.

## Lo que salió de la fábrica

Probé la primera versión con una CLI desechable para TheCatAPI, arreglé lo que esa corrida expuso y saqué v0.2.0 el mismo día.

Después vino [tgctl](https://github.com/jjuanrivvera/tgctl), una CLI estilo `gh` para la Bot API de Telegram: primer commit a la 1:48 pm, tag v0.1.0 firmado a las 3:35 pm de esa misma tarde. Y [lsqueezy](https://github.com/jjuanrivvera/lemon-squeezy-cli), para la API de e-commerce de Lemon Squeezy: primer commit a las 6:34 pm de esa noche, v0.1.0 una hora después. Las dos pasan el mismo gate que alegra-cli se exige a sí misma: 80% de cobertura en CI, lint y chequeos de vulnerabilidades limpios, servidor MCP, agent guard, auth en keyring, y releases firmados con cosign empaquetados para Homebrew y Scoop.

alegra-cli tomó una semana, la mayor parte en una noche larga. tgctl tomó una tarde, y esa tarde la pasé revisando en vez de escribiendo.

Dos advertencias. Cerca de la mitad de los hallazgos del paso de review adversarial son falsos positivos, así que igual tienes que verificar cada uno contra el código antes de actuar, y refutar un hallazgo con citas es un resultado válido. Las pruebas en vivo contra una instancia real son solo opt-in, porque los mocks no ven el comportamiento de la API real pero las escrituras en vivo son irreversibles.

## A dónde va el esfuerzo ahora

Si construyes con agentes, gasta el esfuerzo en escribir tu estándar como spec y en convertir tu definición de terminado en algo que una máquina pueda verificar. Yo lo hice una vez y ahora cada CLI arranca desde ese estándar.

cliwright es MIT y vive en [github.com/jjuanrivvera/cliwright](https://github.com/jjuanrivvera/cliwright). Instálalo como plugin de Claude Code (`/plugin marketplace add jjuanrivvera/cliwright`) o como skill multi-herramienta (`npx skills add jjuanrivvera/cliwright`) y apúntalo a una API que uses.
