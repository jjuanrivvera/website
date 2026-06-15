---
title: 'Cómo construí una CLI agent-first para un sistema contable'
description: 'Construí alegra-cli en una semana con Claude Code. La velocidad vino de estándares altos, enforcement en CI y dos comandos: /goal y /code-review.'
pubDate: 2026-06-21
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'go', 'agentes-de-ia', 'cli', 'alegra']
cover: '@assets/blog/covers/agent-first-cli-cover.jpg'
coverAlt: 'Ilustración flat sobre fondo crema: una ventana de terminal al centro, rodeada por un bucle de dos flechas teal en sentido horario. Un ícono de diana y una lupa sobre una lista de chequeo están sobre el bucle, con pequeños glifos de una factura y una moneda cerca, esbozando un ciclo automatizado de construir y revisar.'
lang: 'es'
translationKey: 'alegra-cli-agent-first'
draft: true
featured: false
---

Construí `alegra-cli` en una semana con Claude Code. [Alegra](https://alegra.com) es una plataforma de contabilidad y facturación muy usada en Latinoamérica; la CLI es un cliente de línea de comandos para su API. La mayor parte salió en una sola noche. El paso crucial vino justo después: lo validé contra todo el OpenAPI de Alegra, y luego hice obligatorio ceñirse a esa especificación en CI, para que el código no pueda desviarse de la API documentada. El resto de la semana se fue en tests, releases, docs y pulido: 125 commits, 310 tests, y una suite de CI que lo hace cumplir.

La mayor parte corrió como un loop agéntico. Usé `/goal` para fijar un objetivo hacia el que el agente trabaja solo, y `/code-review` para encontrar lo que hizo mal. Fija un objetivo, revisa el resultado, mete la revisión en el siguiente objetivo. Alrededor de ese loop mantuve la barra de calidad alta y metí los estándares en CI para que se revisaran en cada commit.

Ya escribí antes sobre [la capa de enforcement](/es/blog/ship-fast-and-safe-with-ai-agents/), por qué importan los hooks y los commits cuando es un agente el que escribe. Este post es el caso práctico: la arquitectura, los estándares, y ese loop, en un proyecto entero.

## La arquitectura que abarató la velocidad

`alegra-cli` envuelve la API de Alegra. El núcleo es un cliente genérico tipado, `Resource[T]`. Cada recurso (un contacto, una factura, un producto, un pago) son exactamente tres archivos: un tipo de datos, un comando, y cero ediciones al código compartido. El recurso veintisiete cuesta tan poco como el primero.

Eso mantiene al agente rápido sin romper cosas. Cuando la paginación, la autenticación, los reintentos y el formato de salida viven en un solo lugar, el agente no puede meter una variante incorrecta en el recurso número veintisiete. La arquitectura absorbe los errores.

La API de Alegra devuelve algunos valores en más de una forma. Algunos IDs llegan como enteros, otros como strings; algunos campos son un objeto `{id, name}`, otras veces solo un número. Unos cuantos tipos flexibles de Go absorben esas variaciones antes de que lleguen a la lógica de negocio, así que el agente nunca tuvo que tratarlas caso por caso.

Desde el día uno la CLI también es un servidor MCP: `alegra mcp` expone cada comando como herramienta de agente. Ese fue el objetivo todo el tiempo, algo que los agentes pudieran manejar directo. (Hago el argumento más amplio de CLIs sobre MCPs en [otro post](/es/blog/clis-sobre-mcps/).)

## Mantener la barra alta

La regla con la que trabajé fue simple: nunca aceptar un "funciona".

Cada vez que el agente terminaba algo, le preguntaba qué seguía estando mal, hacía que lo arreglara, y volvía a preguntar. Cuando una revisión salía buena, la leía como una lista de huecos por cerrar. Así que los cerraba y corría la revisión otra vez. La siguiente nota era más alta, y volvía a preguntar.

Suena a tema de personalidad. En realidad es solo un ciclo, y la mayor parte corre sola una vez que lo montas. Las dos secciones siguientes son el cómo.

## Enforcement con el que el agente no puede discutir

Los estándares solo se sostienen si una máquina los revisa, porque un agente te va a decir que los tests pasan, pasen o no.

Así que los estándares se volvieron barreras:

- **Barrera de cobertura del 80%** que hace fallar el CI si baja. La cobertura pasó de 39.8% a más del 80% en la primera semana y ahí se quedó.
- **golangci-lint** limpio en cada commit, forzado por un hook de pre-commit.
- **Race detector** en Linux, macOS y Windows.
- **Fuzz tests** en los tipos de valor. Encontraron un bug de `NaN`/`Inf` en minutos que un test por ejemplos habría dejado pasar.
- **Tests de contrato** contra los esquemas documentados de Alegra, más un control que detecta si el código se desvía de la especificación, sin tocar la red.
- Releases firmados con SBOM, y `govulncheck` en CI.

El agente puede afirmar lo que sea. La barrera es en lo que de verdad confío, y es lo que hace seguro dejar que el agente vaya rápido.

## /goal: fija un objetivo y déjalo correr

`/goal` pone una condición de parada en la sesión. Le doy un objetivo que puedo verificar (llegar al 80% de cobertura, terminar el issue #22, arreglar todos los hallazgos de la última revisión) y el agente sigue trabajando hasta que la condición se cumple. Dentro de ese objetivo toma sus propias decisiones: qué tests escribir primero, cómo estructurar los casos límite, qué archivos tocar.

Esto es lo que me dejó iterar sin estar encima. Mi trabajo pasó a ser fijar objetivos y revisar resultados. Los objetivos tienen que ser de los que una máquina puede confirmar, por eso importan tanto las barreras de arriba. El CI puede comprobar "80% de cobertura", así que funciona como objetivo. "Hazlo mejor" no le da al agente nada a qué apuntar.

## /code-review: un panel de revisión cuando lo pido

El otro caballo de batalla fue el skill `/code-review:code-review`. Abre varios agentes en paralelo, cada uno cazando una clase distinta de problema (bugs, guardas eliminadas, rupturas entre archivos, trampas del lenguaje), y luego les hace verificar de forma adversarial cada hallazgo antes de reportar, así que el ruido se filtra antes de llegarme.

Lo corrí en cada PR que valía la pena. En el release de seguridad se ganó su lugar: atrapó un hook de guarda que fallaba _abierto_, uno que habría dejado pasar un comando destructivo con cierta entrada. Eso se habría publicado. Cada revisión alimentaba el siguiente `/goal`: arregla todo lo que encontró, no pares hasta que esté limpio.

Esas cuatro piezas se apilan una sobre otra. Yo defino qué significa bien, una máquina lo revisa, el agente trabaja hacia eso, y una pasada aparte verifica el resultado.

## Seguridad desde el principio

La CLI guarda el token de la API en el keyring del sistema operativo, nunca en un archivo de config. `--dry-run` imprime el curl exacto antes de enviar nada. Los borrados piden confirmación. Después agregué `alegra agent guard`, que genera hooks PreToolUse que bloquean operaciones irreversibles en el host del agente, antes de que el comando llegue siquiera a la CLI. La capa MCP además marca las herramientas de escritura para que los hosts que las entienden pregunten primero.

## Por qué fue rápido y aun así seguro

Moverse así de rápido suena a saltarse pasos. No lo hice. Cada cambio pasó por un PR a `develop`, el CI tenía que estar verde antes del merge, los tags disparaban el release, y `main` se promovía limpio. Una vez el agente hizo commit directo a `develop`. Lo revertí y mandé el trabajo por un PR como todo lo demás.

La velocidad vino de tres cosas apiladas: una arquitectura donde extender es casi gratis, enforcement que hizo seguro moverse, y `/goal` más `/code-review` para autonomía y verificación. El sistema alrededor del modelo es lo que produjo el ritmo.

Si construiste con un agente y el resultado fue mediocre, el modelo probablemente no era el problema. Lo que importa es qué tan bien lo diriges y qué tan fuertes son tus protecciones. Esa parte es tuya.

---

`alegra-cli` es MIT y vive en [github.com/jjuanrivvera/alegra-cli](https://github.com/jjuanrivvera/alegra-cli). Se instala con Homebrew, Scoop, Docker, o `go install`. Si usas Alegra y trabajas con agentes, es un punto de partida.
