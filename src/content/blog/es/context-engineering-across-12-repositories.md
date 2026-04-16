---
title: 'Ingeniería de Contexto en 12 Repositorios'
description: 'Trabajar con 12 repositorios en diferentes stacks es más complicado para los asistentes de IA de lo que parece. Este es el sistema de contexto al que llegué.'
pubDate: 2026-04-15
author: 'Juan Felipe Rivera González'
tags:
  [
    'claude-code',
    'ia',
    'ingenieria-de-contexto',
    'herramientas-dev',
    'productividad',
  ]
cover: '@assets/blog/covers/context-engineering-12-repos-cover.jpg'
coverAlt: 'Un folder cyan brillante en el centro de una escena azul oscuro, conectado por líneas neón finas a doce nodos de repositorios más pequeños orbitando alrededor. Sobre el folder central, tres capas horizontales apiladas representan una jerarquía de contexto, cada una con un pequeño icono de archivo markdown. Símbolos de código tenues flotan en el fondo.'
lang: 'es'
translationKey: 'context-engineering-12-repos'
draft: false
featured: true
---

Trabajar con un cliente que tiene 12 proyectos en diferentes stacks (servicios en PHP, un portal en Django, CLIs en Go, cloud functions en Python, una capa de JavaScript inyectada en un LMS) es un problema más complicado para los asistentes de IA de lo que parece. Cada repo tiene sus propias convenciones, su propio setup de pruebas, su propio flujo de deployment. Al mismo tiempo, comparten bases de datos, se mandan eventos entre sí, y están encima de una migración en vivo de un backend legacy a uno nuevo. Un cambio en un sistema suele requerir un cambio correspondiente en otro. Un ingeniero que se une al equipo no aprende una base de código. Aprende cómo las bases de código interactúan entre sí.

Claude Code, Codex, Cursor y Opencode resuelven el problema de "cómo funciona este proyecto" con archivos de instrucciones: CLAUDE.md para Claude Code, AGENTS.md para los demás, cargados al inicio de cada sesión. Este es el punto de partida de la ingeniería de contexto: darle al agente el contexto que necesita para resolver la tarea, y nada más.

Un solo archivo de instrucciones es suficiente cuando solo tocas un proyecto. Empieza a mostrar fisuras cuando el mismo ingeniero tiene que operar en toda una organización. Algunas reglas aplican en todas partes (cómo escribir un commit, qué linter usar, qué preferencias de herramientas seguir). Algunas aplican solo a un repo. Meter todo en un archivo plano duplica las reglas transversales en los 12 repos, o las deja fuera. Y meter todo en un archivo gigante tampoco es solución. Una investigación de ETH Zurich sobre contexto inflado en agentes muestra que los archivos de instrucciones sobre-dimensionados aumentan los costos de inferencia mientras reducen la tasa de éxito de las tareas. HumanLayer observó algo más fuerte: el system prompt de Claude Code le dice al modelo que ignore contenido del CLAUDE.md que no sea directamente relevante a la tarea actual. Rellenar el archivo no solo gasta tokens. Compite con las reglas que importan.

Entonces el problema es: ¿cómo le das a un agente el mismo contexto de onboarding que recibe un ingeniero nuevo (convenciones de toda la empresa, cómo se relacionan los sistemas, detalles específicos de cada proyecto) sin hacer explotar la ventana de contexto ni duplicar contenido en cada repo?

El approach al que llegué tiene tres capas de archivos de instrucciones, un directorio compartido `.agents/` con skills y contexto adicional, y una estrategia de symlinks que funciona en todos los agentes que uso.

## Tres Capas de Instrucciones

**Global.** Un solo archivo en `~/.claude/CLAUDE.md` que se carga en cada sesión, en cada máquina. Esto es "cómo trabajo yo" en general, nada específico de cliente: preferencias de herramientas, convenciones de commits, reglas de seguridad de git, defaults para filtrar output. Si cambio de cliente mañana, este archivo se va conmigo sin cambios.

**Workspace.** Un CLAUDE.md en la raíz del folder que contiene todos los repos de un cliente. Aquí es donde sucede la mayor parte de la magia, porque aquí es donde el agente aprende cómo funciona la organización:

- Qué repos existen y para qué es cada uno. Una descripción de una línea por repo para que el agente conozca la superficie.
- Cómo fluyen los datos entre servicios: qué repo produce qué eventos, cuál los consume, dónde vive cada base de datos, qué servicio es dueño de qué dominio.
- Dirección de la migración ("revisa primero el backend legacy antes de asumir que el feature está en el API nuevo").
- Mapeo de ambientes (test, beta, prod) y las CLIs que los manejan.
- Patrones transversales que sigue el equipo: cómo se nombran los tickets, cómo se crean las ramas, cómo se coordinan los releases.

Un agente trabajando en el portal de Django ahora sabe que el productor de eventos upstream es el LMS en PHP, aunque ese hecho no esté escrito en ningún lado dentro del repo de Django. La mayoría de los setups de un solo archivo se pierden esta capa completamente, y es la que más tiempo ahorra.

**Proyecto.** Cada repo tiene su propio CLAUDE.md con los detalles que solo ese repo necesita: convenciones del framework, comandos locales de test que de verdad funcionan, gotchas conocidos, procedimientos de recuperación cuando el entorno se rompe.

Tres capas, sin redundancia. Cada una lleva lo que las otras dos no.

## Qué Va en Estos Archivos

El filtro que aplico: si el agente lo hace bien sin que yo le diga, la regla no va en el archivo. Si el agente se equivoca sin el contexto, la regla va. Todo lo demás es ruido.

Reglas que pasan el filtro:

- "Las rutas están en una tabla de base de datos, no en un archivo de config." El agente nunca lo adivinaría. Hardcodea rutas si no se le dice.
- "Usa Docker Compose para correr los tests. PHPUnit solo salta el resolver de tenants." Sin esto, el agente pierde tiempo debugueando errores de tenant.
- "Usa pnpm, no npm." Aplica a cada proyecto JS que toco, así que vive en el nivel global.

Reglas que no pasan el filtro:

- "Este es un proyecto Django 4." El agente lee `settings.py` y lo sabe.
- "Los controladores siguen un patrón service-repository." El agente lee `app/` y lo infiere.
- "Usamos PSR-12 para el estilo de código PHP." Un linter lo aplica; el agente no necesita el recordatorio.

Ese último apunta a un patrón más general: las reglas que se pueden aplicar mecánicamente no deberían estar en las instrucciones. Deberían estar en un git hook o un linter. Voy a volver a esto en un próximo post, porque la capa de enforcement es un tema por sí sola.

Los archivos de contexto deberían encogerse con el tiempo, no crecer. El punto de Martin Fowler aplica: "lo que tal vez tuviste que meter en el contexto hace medio año puede que ya no sea necesario." Los modelos mejoran. Borra lo que ya no gana sus tokens.

## Skills como Contexto Auto-Discoverable

Los archivos de instrucciones tienen una limitación estructural: se cargan en cada sesión, sin importar de qué sea la sesión. Mientras más crecen, más contenido irrelevante se carga en cada turno. Por eso el filtro de arriba importa.

Los skills resuelven la otra mitad del problema. Un skill es un archivo markdown con frontmatter YAML arriba describiendo cuándo debería activarse, y un cuerpo describiendo los pasos. A diferencia de los archivos de instrucciones, los skills no se cargan todos de una. El agente escanea las descripciones del frontmatter de los skills disponibles y decide cuál cargar según la tarea. Los skills irrelevantes se quedan fuera.

Esto cambia el diseño de la ingeniería de contexto. Cualquier contexto que solo sea relevante para una tarea específica (cómo hacer deploy de un servicio, cómo correr una migración contra un ambiente específico, cómo construir un curso en el LMS, cómo hacer onboarding de un nuevo partner en el portal) no pertenece al CLAUDE.md siempre-cargado. Pertenece a un skill, activado solo cuando la tarea lo amerita.

Así que una cantidad sorprendente de contenido que la gente mete en CLAUDE.md debería salir. Procedimientos paso a paso. Runbooks específicos de ambiente. Workflows multi-fase. Cualquier cosa atada a una tarea específica puede vivir como un skill, fuera de la sesión hasta que la tarea aparezca.

Los skills viven en dos niveles, igual que los archivos de instrucciones:

- **Skills personales** como automatizaciones de Google Workspace, digest diario, o transcripción de audio viven en `~/.claude/skills/`. Disponibles en cualquier máquina.
- **Skills de organización** como construcción de cursos, herramientas de base de datos, o scripts de deployment necesitan llegar a cada repo dentro del workspace del cliente.

La pregunta es dónde viven físicamente los skills a nivel de organización. Cada herramienta descubre los skills en su propia ruta, así que comprometerse con una sola ruta deja por fuera a las demás. La siguiente sección cubre el layout que uso para evitarlo.

## El Folder .agents/ como Fuente de Verdad

La forma a la que llegué: un solo folder `.agents/` en la raíz de la organización, con todo lo compartido adentro.

```
~/Repos/client/
├── CLAUDE.md                   ← instrucciones de workspace
├── .agents/
│   ├── skills/                 ← procedimientos reutilizables (deploy, migrate, onboard)
│   ├── agents/                 ← reviewers especializados (PHP, QA, sistemas)
│   └── docs/                   ← runbooks, postmortems, notas de arquitectura
├── repo-1/
│   ├── CLAUDE.md               ← instrucciones de proyecto
│   └── .claude/skills  → ../.agents/skills
└── repo-2/
    ├── CLAUDE.md
    └── .claude/skills  → ../.agents/skills
```

Cada repo lleva un symlink `.claude/skills` apuntando a `../.agents/skills`. Una sola fuente de verdad, cada repo la consume, un solo edit actualiza los 12 proyectos al instante.

`.agents/` tiene más que solo skills. Es donde vive el contexto compartido a nivel de organización:

- **Agentes de review especializados** que los sub-agentes pueden adoptar: un experto en PHP cebado con las convenciones de MVC custom, un agente de QA que conoce el framework de tests de cada repo, un reviewer de sistemas que chequea dependencias cross-project.
- **Runbooks y postmortems**: notas de arquitectura que no caben en el CLAUDE.md de ningún repo, writeups de incidentes, diagramas de ambiente. El agente los puede traer on-demand, igual que con los skills, sin gastar tokens en cada sesión.

Para herramientas que ya leen `.agents/` nativamente (Codex, Cursor, Copilot y demás), no hace falta symlink. Para Claude Code, el symlink de `.claude/skills` cubre la brecha hasta que haya soporte nativo de `.agents/`. Cuando llegue, esos symlinks desaparecen.

El principio importa más que el layout exacto del directorio: una sola fuente de verdad, consumida por cada herramienta, sin vendor lock-in. Apuntar un agente nuevo al mismo folder le da todo de una.

## Agentes Especializados como Reviewers Paralelos

Uno de los subfolders de `.agents/` tiene agentes de review custom. Cada uno es un markdown que ceba un sub-agente con un foco específico: un experto en PHP sobre las convenciones de MVC custom, un especialista en JavaScript sobre la regla de dual-build durante la migración, un reviewer de sistemas sobre dependencias cross-project, un agente de QA sobre frameworks de tests.

La especialización importa. Un prompt genérico de "review this code" da feedback genérico. Un agente cebado con cientos de líneas de convenciones del proyecto da feedback que suena como si viniera de alguien que ha estado en el proyecto por un año. Los corro en paralelo durante los reviews. La sesión padre solo ve los resúmenes, así que su ventana de contexto se mantiene liviana.

Aquí es donde la ingeniería de contexto deja de ser "el archivo que escribes" y se vuelve "rutear la porción correcta de ese contexto al paso correcto de la tarea." Los archivos de instrucciones, los skills, y los agentes especializados son todos parte del mismo sistema de ruteo.

Todo lo descrito arriba es un workaround manual. Aguanta bien hoy, y es lo que hace que 12 repos se sientan como un solo ambiente de ingeniería coherente en vez de 12 desconectados. Un post posterior en esta serie va a cubrir el approach de plugin que elimina el plumbing manual por completo.
