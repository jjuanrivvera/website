---
title: 'Ingenieria de Contexto en 12 Repositorios'
description: 'Trabajar con 12 repositorios en diferentes stacks es mas complicado para los asistentes de IA de lo que parece. Este es el sistema de contexto al que llegue.'
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
coverAlt: 'Un folder cyan brillante en el centro de una escena azul oscuro, conectado por lineas neon finas a doce nodos de repositorios mas pequeños orbitando alrededor. Sobre el folder central, tres capas horizontales apiladas representan una jerarquia de contexto, cada una con un pequeño icono de archivo markdown. Simbolos de codigo tenues flotan en el fondo.'
lang: 'es'
translationKey: 'context-engineering-12-repos'
draft: false
featured: false
---

Trabajar con un cliente que tiene 12 proyectos en diferentes stacks (servicios en PHP, un portal en Django, CLIs en Go, cloud functions en Python, una capa de JavaScript inyectada en un LMS) es un problema mas complicado para los asistentes de IA de lo que parece. Cada repo tiene sus propias convenciones, su propio setup de pruebas, su propio flujo de deployment. Al mismo tiempo, comparten bases de datos, se mandan eventos entre si, y estan encima de una migracion en vivo de un backend legacy a uno nuevo. Un cambio en un sistema suele requerir un cambio correspondiente en otro. Un ingeniero que se une al equipo no aprende una base de codigo. Aprende como las bases de codigo interactuan entre si.

Claude Code, Codex, Cursor y Opencode resuelven el problema de "como funciona este proyecto" con archivos de instrucciones: CLAUDE.md para Claude Code, AGENTS.md para los demas, cargados al inicio de cada sesion. Este es el punto de partida de la ingenieria de contexto: darle al agente el contexto que necesita para resolver la tarea, y nada mas.

Un solo archivo de instrucciones es suficiente cuando solo tocas un proyecto. Empieza a mostrar fisuras cuando el mismo ingeniero tiene que operar en toda una organizacion. Algunas reglas aplican en todas partes (como escribir un commit, que linter usar, que preferencias de herramientas seguir). Algunas aplican solo a un repo. Meter todo en un archivo plano duplica las reglas transversales en los 12 repos, o las deja fuera. Y meter todo en un archivo gigante tampoco es solucion. Una investigacion de ETH Zurich sobre contexto inflado en agentes muestra que los archivos de instrucciones sobre-dimensionados aumentan los costos de inferencia mientras reducen la tasa de exito de las tareas. HumanLayer observo algo mas fuerte: el system prompt de Claude Code le dice al modelo que ignore contenido del CLAUDE.md que no sea directamente relevante a la tarea actual. Rellenar el archivo no solo gasta tokens. Compite con las reglas que importan.

Entonces el problema es: como le das a un agente el mismo contexto de onboarding que recibe un ingeniero nuevo (convenciones de toda la empresa, como se relacionan los sistemas, detalles especificos de cada proyecto) sin hacer explotar la ventana de contexto ni duplicar contenido en cada repo?

El approach al que llegue tiene tres capas de archivos de instrucciones, un directorio compartido `.agents/` con skills y contexto adicional, y una estrategia de symlinks que funciona en todos los agentes que uso.

## Tres Capas de Instrucciones

**Global.** Un solo archivo en `~/.claude/CLAUDE.md` que se carga en cada sesion, en cada maquina. Esto es "como trabajo yo" en general, nada especifico de cliente: preferencias de herramientas, convenciones de commits, reglas de seguridad de git, defaults para filtrar output. Si cambio de cliente mañana, este archivo se va conmigo sin cambios.

**Workspace.** Un CLAUDE.md en la raiz del folder que contiene todos los repos de un cliente. Aqui es donde sucede la mayor parte de la magia, porque aqui es donde el agente aprende como funciona la organizacion:

- Que repos existen y para que es cada uno. Una descripcion de una linea por repo para que el agente conozca la superficie.
- Como fluyen los datos entre servicios: que repo produce que eventos, cual los consume, donde vive cada base de datos, que servicio es dueño de que dominio.
- Direccion de la migracion ("revisa primero el backend legacy antes de asumir que el feature esta en el API nuevo").
- Mapeo de ambientes (test, beta, prod) y las CLIs que los manejan.
- Patrones transversales que sigue el equipo: como se nombran los tickets, como se crean las ramas, como se coordinan los releases.

Un agente trabajando en el portal de Django ahora sabe que el productor de eventos upstream es el LMS en PHP, aunque ese hecho no este escrito en ningun lado dentro del repo de Django. La mayoria de los setups de un solo archivo se pierden esta capa completamente, y es la que mas tiempo ahorra.

**Proyecto.** Cada repo tiene su propio CLAUDE.md con los detalles que solo ese repo necesita: convenciones del framework, comandos locales de test que de verdad funcionan, gotchas conocidos, procedimientos de recuperacion cuando el entorno se rompe.

Tres capas, sin redundancia. Cada una lleva lo que las otras dos no.

## Que Va en Estos Archivos

El filtro que aplico: si el agente lo hace bien sin que yo le diga, la regla no va en el archivo. Si el agente se equivoca sin el contexto, la regla va. Todo lo demas es ruido.

Reglas que pasan el filtro:

- "Las rutas estan en una tabla de base de datos, no en un archivo de config." El agente nunca lo adivinaria. Hardcodea rutas si no se le dice.
- "Usa Docker Compose para correr los tests. PHPUnit solo salta el resolver de tenants." Sin esto, el agente pierde tiempo debuggeando errores de tenant.
- "Usa pnpm, no npm." Aplica a cada proyecto JS que toco, asi que vive en el nivel global.

Reglas que no pasan el filtro:

- "Este es un proyecto Django 4." El agente lee `settings.py` y lo sabe.
- "Los controladores siguen un patron service-repository." El agente lee `app/` y lo infiere.
- "Usamos PSR-12 para el estilo de codigo PHP." Un linter lo aplica; el agente no necesita el recordatorio.

Ese ultimo apunta a un patron mas general: las reglas que se pueden aplicar mecanicamente no deberian estar en las instrucciones. Deberian estar en un git hook o un linter. Voy a volver a esto en un proximo post, porque la capa de enforcement es un tema por si sola.

Los archivos de contexto deberian encogerse con el tiempo, no crecer. El punto de Martin Fowler aplica: "lo que tal vez tuviste que meter en el contexto hace medio año puede que ya no sea necesario." Los modelos mejoran. Borra lo que ya no gana sus tokens.

## Skills como Contexto Auto-Discoverable

Los archivos de instrucciones tienen una limitacion estructural: se cargan en cada sesion, sin importar de que sea la sesion. Mientras mas crecen, mas contenido irrelevante se carga en cada turno. Por eso el filtro de arriba importa.

Los skills resuelven la otra mitad del problema. Un skill es un archivo markdown con frontmatter YAML arriba describiendo cuando deberia activarse, y un cuerpo describiendo los pasos. A diferencia de los archivos de instrucciones, los skills no se cargan todos de una. El agente escanea las descripciones del frontmatter de los skills disponibles y decide cual cargar segun la tarea. Los skills irrelevantes se quedan fuera.

Esto cambia el diseño de la ingenieria de contexto. Cualquier contexto que solo sea relevante para una tarea especifica (como hacer deploy de un servicio, como correr una migracion contra un ambiente especifico, como construir un curso en el LMS, como hacer onboarding de un nuevo partner en el portal) no pertenece al CLAUDE.md siempre-cargado. Pertenece a un skill, activado solo cuando la tarea lo amerita.

Asi que una cantidad sorprendente de contenido que la gente mete en CLAUDE.md deberia salir. Procedimientos paso a paso. Runbooks especificos de ambiente. Workflows multi-fase. Cualquier cosa atada a una tarea especifica puede vivir como un skill, fuera de la sesion hasta que la tarea aparezca.

Los skills viven en dos niveles, igual que los archivos de instrucciones:

- **Skills personales** como automatizaciones de Google Workspace, digest diario, o transcripcion de audio viven en `~/.claude/skills/`. Disponibles en cualquier maquina.
- **Skills de organizacion** como construccion de cursos, herramientas de base de datos, o scripts de deployment necesitan llegar a cada repo dentro del workspace del cliente.

La pregunta es donde viven fisicamente los skills a nivel de organizacion. Cada herramienta descubre los skills en su propia ruta, asi que comprometerse con una sola ruta deja por fuera a las demas. La siguiente seccion cubre el layout que uso para evitarlo.

## El Folder .agents/ como Fuente de Verdad

La forma a la que llegue: un solo folder `.agents/` en la raiz de la organizacion, con todo lo compartido adentro.

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

`.agents/` tiene mas que solo skills. Es donde vive el contexto compartido a nivel de organizacion:

- **Agentes de review especializados** que los sub-agentes pueden adoptar: un experto en PHP cebado con las convenciones de MVC custom, un agente de QA que conoce el framework de tests de cada repo, un reviewer de sistemas que chequea dependencias cross-project.
- **Runbooks y postmortems**: notas de arquitectura que no caben en el CLAUDE.md de ningun repo, writeups de incidentes, diagramas de ambiente. El agente los puede traer on-demand, igual que con los skills, sin gastar tokens en cada sesion.

Para herramientas que ya leen `.agents/` nativamente (Codex, Cursor, Copilot y demas), no hace falta symlink. Para Claude Code, el symlink de `.claude/skills` cubre la brecha hasta que haya soporte nativo de `.agents/`. Cuando llegue, esos symlinks desaparecen.

El principio importa mas que el layout exacto del directorio: una sola fuente de verdad, consumida por cada herramienta, sin vendor lock-in. Apuntar un agente nuevo al mismo folder le da todo de una.

## Agentes Especializados como Reviewers Paralelos

Uno de los subfolders de `.agents/` tiene agentes de review custom. Cada uno es un markdown que ceba un sub-agente con un foco especifico: un experto en PHP sobre las convenciones de MVC custom, un especialista en JavaScript sobre la regla de dual-build durante la migracion, un reviewer de sistemas sobre dependencias cross-project, un agente de QA sobre frameworks de tests.

La especializacion importa. Un prompt generico de "review this code" da feedback generico. Un agente cebado con cientos de lineas de convenciones del proyecto da feedback que suena como si viniera de alguien que ha estado en el proyecto por un año. Los corro en paralelo durante los reviews. La sesion padre solo ve los resumenes, asi que su ventana de contexto se mantiene liviana.

Aqui es donde la ingenieria de contexto deja de ser "el archivo que escribes" y se vuelve "rutear la porcion correcta de ese contexto al paso correcto de la tarea." Los archivos de instrucciones, los skills, y los agentes especializados son todos parte del mismo sistema de ruteo.

Todo lo descrito arriba es un workaround manual. Aguanta bien hoy, y es lo que hace que 12 repos se sientan como un solo ambiente de ingenieria coherente en vez de 12 desconectados. Un post posterior en esta serie va a cubrir el approach de plugin que elimina el plumbing manual por completo.
