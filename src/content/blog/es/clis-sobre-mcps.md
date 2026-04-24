---
title: 'CLIs en lugar de MCPs para integrar herramientas de IA'
description: 'Los MCP guardan credenciales en JSON. Los CLI las dejan en el keyring. Después de seis meses con ambos, moví mis integraciones fuera de MCP.'
pubDate: 2026-05-04
author: 'Juan Felipe Rivera González'
tags: ['claude-code', 'mcp', 'cli', 'go', 'security']
cover: '@assets/blog/covers/clis-over-mcps-cover.jpg'
coverAlt: 'Ilustración editorial de doble panel titulada MCP vs CLI sobre fondo crema. A la izquierda, un fragmento de config JSON con un campo PASSWORD expuesto y resaltado en rojo, junto a un grupo de iconos de servicios (base de datos, navegador, tickets, nube, chat) cada uno etiquetado con una advertencia API_KEY en rojo, todos enredados alrededor de un bloque central MCP SERVER. A la derecha, una terminal limpia con comandos cf zones list, gh pr view, bw get password, un icono de keyring con un check verde, y los mismos servicios ordenados en fila conectados limpiamente a un único bloque CLI BINARY.'
lang: 'es'
translationKey: 'clis-over-mcps'
draft: false
featured: false
---

El Model Context Protocol (MCP) es la forma estándar de darle acceso a servicios externos a los asistentes de IA para código. Un MCP de MySQL expone consultas a la base de datos. Un MCP de Playwright expone automatización del navegador. Un MCP de Jira expone operaciones sobre tickets. El agente descubre las herramientas, las llama y trabaja.

El patrón es útil. Algunos MCPs lo hacen bien: el de Atlassian usa OAuth a través de un flujo de navegador sin secretos en config. Otros traen salvaguardas integradas. El MCP de MySQL que yo usaba corre por defecto en modo solo lectura y rechaza DDL. Esa restricción suena bien sobre el papel, pero el patrón de almacenamiento de credenciales que hay por debajo la hace evitable. Si las credenciales viven en un JSON que el agente puede leer directamente, el agente no necesita la función de consulta del MCP para llegar a la base de datos. Puede leer el config, tomar la contraseña y conectarse por su cuenta.

Después de seis meses corriendo ambos en producción, dejé los servidores MCP que usaba para Canvas, MySQL y automatización de navegador. Canvas pasó a canvas-cli. MySQL pasó a un CLI interno en Go que mantengo para el día a día con un cliente (también cubre despliegues, health checks y gestión de servicios). La automatización del navegador pasó a playwright-cli. Dos de esos tres son CLIs que yo mantengo; el tercero es una herramienta existente.

El [post anterior](/blog/ship-fast-and-safe-with-ai-agents) cubrió la capa de enforcement que mantiene el comportamiento del agente seguro dentro del editor. Hooks, linters, escáneres de secretos, listas de permisos, puertas de finalización. Este post cubre la capa más allá: cómo el agente llega a los servicios externos, y por qué los MCPs no siempre son la mejor opción para esa tarea.

Una nota de alcance antes de seguir. Este post asume un agente que puede ejecutar comandos de shell, como Claude Code o Cursor en modo agente. Si tu agente no tiene acceso a shell (chatbots web, agentes embebidos en UIs, la mayoría de asistentes SaaS), los MCPs son el camino correcto. Incluso ahí, el patrón de abajo aplica: construye la funcionalidad como CLI primero, y luego envuélvela como MCP cuando necesites la superficie del protocolo. La sección "Un binario, dos interfaces" al final muestra cómo en una librería de Go.

## Lo primero que se rompe: las credenciales

Una configuración típica de un MCP de MySQL:

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

La contraseña de la base de datos vive en un archivo JSON. Si el archivo está en la raíz del proyecto, un `.gitignore` mal configurado basta para que termine en el commit. Incluso si el `.gitignore` está correcto, la credencial existe como texto plano en disco, legible por cualquier proceso del usuario, incluido el agente. La seguridad que el MCP añade por encima (modo solo lectura, tablas en allowlist, límites de longitud de queries) deja de ser una barrera en cuanto el agente puede abrir el config y usar la credencial directamente.

No todos los servicios tienen un flujo OAuth disponible. MySQL, Redis, buckets de almacenamiento en la nube y APIs legadas requieren una API key o usuario/contraseña para autenticarse. Cuando el servicio necesita un secreto compartido, ese secreto tiene que estar en algún lugar que el cliente pueda leer. En los MCPs que usaba, ese lugar era el archivo de config del agente. Los servicios que sí soportan OAuth (el MCP de Atlassian, por ejemplo) esquivan esto por completo, pero para el resto la credencial vive con la integración y por lo tanto al alcance del agente.

Tenía cinco MCPs de MySQL repartidos en dos proyectos. Cada uno cargaba credenciales en texto plano. El MCP de Playwright y la evaluación de Canvas LMS tenían el mismo patrón: credenciales en config, porque así estaban construidos esos MCPs.

## Lo que un CLI resuelve

Un CLI se para entre el agente y el servicio. El agente corre comandos y lee salida estructurada. Dos cosas cambian de forma estructural respecto al setup con MCP:

- **La auth se queda fuera del contexto.** Los tokens viven en el keyring del sistema. El agente corre `canvas courses list` y nunca ve un token OAuth. El refresh del token, los retries en 401 y los device flows pasan todos dentro del CLI.
- **El contexto se mantiene pequeño.** Los servidores MCP registran sus esquemas de herramientas con el agente al inicio de la sesión, antes de que empiece cualquier trabajo. Diez MCPs pueden sumar decenas de miles de tokens de descripciones de herramientas que viven en contexto durante toda la sesión. Un CLI no añade nada hasta que lo llamas; solo la salida de las llamadas reales entra en contexto. Y esa salida es componible: el agente puede pasarla por `jq`, `grep`, `head` o `awk` para descartar campos y recortar tamaño antes de que nada llegue al contexto. Los CLIs modernos están construidos con eso en mente, entregando formatos de salida amigables para LLMs (JSON estable, modos compactos opcionales, flags terses, verbosidad opt-in). Con los precios actuales de API y los recortes de rate limits, esa es la diferencia entre una sesión que te puedes permitir y una que no.
- **La dirección es de una sola vía.** Un CLI se puede envolver como un servidor MCP más tarde (ophis hace esto para CLIs basados en Cobra con una sola llamada a una librería, mostrado más adelante). Ir al revés es más difícil. Los servidores MCP corren dentro del runtime del protocolo. Para convertir uno en un comando de shell usable, reescribes casi todo. Construir primero el CLI mantiene ambas opciones abiertas y permite exponer la superficie MCP solo cuando un cliente realmente la pida.

Un CLI bien construido también puede traer rate limiting, caché, paginación y mensajes de error más limpios. Los MCPs pueden traer las mismas cosas. Las tres ventajas de arriba son las únicas que están horneadas en la forma de cada enfoque.

## Lo que los LLMs ya conocen

Los CLIs mainstream ya están en los datos de entrenamiento del LLM. `gh`, `gcloud`, `aws`, `kubectl`, `docker`, `git`. Un agente no necesita un esquema, una descripción de herramienta ni un cargador de contexto por sesión para usarlos. Se sabe los flags y las formas de salida por defecto.

Esto desplaza el tradeoff MCP-vs-CLI. Un MCP de GitHub es el default popular para dar acceso a GitHub al agente. El CLI `gh` suele ser la mejor opción: el agente ya lo conoce, `gh pr list --json ...` da salida estructurada limpia, y el token se queda en `~/.config/gh/hosts.yml` donde solo la shell puede llegar.

El movimiento está pasando también a nivel de proveedor. Cloudflare lanzó `cf` en abril de 2026 como technical preview, posicionado explícitamente como el camino para el acceso de agentes de IA a su plataforma. El alcance actual es un subconjunto de sus productos. El objetivo es cobertura completa (miles de operaciones en más de 100 productos). Google Workspace expone `gws` para la misma superficie. Los proveedores están construyendo superficies CLI-first por las razones que este post plantea.

Para los CLIs que un LLM no conoce (herramientas internas, CLIs de nichos específicos), la [capa de contexto del post 1](/blog/context-engineering-across-12-repositories) cubre el hueco. Un archivo de skill que documente qué hace el CLI y cuándo usarlo es suficiente. Las skills son auto-descubribles por el runtime, así que las relevantes se cargan solo cuando la tarea coincide. En mi setup, `canvas-cli` y el CLI interno tienen cada uno un archivo de skill al lado de su código, y el agente los levanta automáticamente cuando surge una tarea de Canvas o de infra.

## Dos CLIs en la práctica

### canvas-cli (open source)

[canvas-cli](https://github.com/jjuanrivvera/canvas-cli) es un CLI en Go que mantengo para Canvas LMS. Empezó como herramienta personal y hoy expone 280+ comandos que cubren cursos, assignments, módulos, enrollments, submissions y más.

La auth usa OAuth 2.0 con PKCE y guarda los tokens en el keyring del sistema. El soporte multi-instancia me deja cambiar de entorno: `canvas --instance production courses list` versus `canvas --instance sandbox courses list`. Los formatos de salida incluyen JSON, tabla y CSV. El agente típicamente usa `--output json` porque es más fácil de parsear.

Sin configuración específica del protocolo, sin runtime especial. Un único binario estáticamente linkeado en el PATH. Si mañana cambiara de herramienta de IA, el CLI seguiría funcionando sin cambios.

### Un CLI interno de cliente con barandas de seguridad

Para mi día a día con un cliente también mantengo un CLI en Go que maneja despliegues, consultas a base de datos, health checks y gestión de servicios. No es open source porque es específico de ese entorno, pero los patrones de seguridad se generalizan:

- **`--dry-run`** muestra lo que el comando haría sin hacerlo. El agente lo corre primero en cualquier operación destructiva.
- **`--explain`** describe la operación en lenguaje claro: qué servicios se ven afectados, en qué orden ocurren las cosas, qué depende de qué.
- **Solo lectura por defecto.** Las consultas a la base de datos obtienen conexiones de solo lectura a menos que el comando sea explícitamente de escritura. Las operaciones de escritura requieren un flag `--write` explícito.
- **Timeouts de query y límites de tamaño de resultado.** Un `SELECT *` sin filtro sobre una tabla grande falla temprano en vez de devolver un gigabyte al contexto del agente.

El agente no puede correr accidentalmente una operación destructiva porque el CLI la rechaza a menos que los flags lo autoricen. Esto se empareja directamente con la allowlist de permisos del [post de enforcement](/blog/ship-fast-and-safe-with-ai-agents). La allowlist puede hacer match sobre un patrón de comando específico: `Bash(mycli db query --read-only:*)` permitido, cualquier variante con `--write` denegada. La estructura del comando expone la intención destructiva, así que la allowlist la puede controlar. Una llamada a herramienta MCP esconde esa intención detrás de un `mysql_query` genérico, así que la allowlist tiene que permitir o denegar toda la herramienta. La operación específica que hay adentro queda invisible para ella.

## Cuándo gana el MCP

No reemplacé todo. Jira se quedó como MCP.

La razón es la cobertura funcional. Mi flujo de Jira usa worklogs (list, edit, delete, no solo add), comentarios en formato ADF (bold, multi-párrafo), búsqueda de cuentas de usuario, metadata de tipos de issue para creación programática de tickets y búsqueda con Rovo AI. Evalué tanto el CLI oficial de Atlassian (ACLI) como la opción open source más fuerte (ankitpokhrel/jira-cli, ~5K estrellas). A abril de 2026, jira-cli soporta `worklog add` pero no CRUD completo, acepta markdown para comentarios pero no preserva la estructura ADF, y no tiene búsqueda de usuarios ni metadata de campos por tipo de issue. ACLI está evolucionando pero todavía se queda corto para mi flujo.

El MCP de Atlassian vía OAuth cubre todo eso. Un único flujo de auth en navegador, y el agente obtiene herramientas tipadas sobre toda la superficie de la API.

La regla que uso: cuando el CLI cubre suficiente de lo que el agente necesita, úsalo. Cuando el hueco es lo bastante grande como para importar, quédate con el MCP.

## Escribir un CLI pensando en agentes

Algunos patrones que hacen que un CLI funcione bien para consumo por IA:

- **Salida estructurada por defecto, o a un flag de distancia.** `--output json` le gana a parsear layouts de tabla.
- **Una operación por comando.** `canvas courses list` le gana a `canvas manage --resource courses --action list`.
- **Espacio de comandos plano.** Máximo dos o tres niveles de anidamiento. Los agentes descubren comandos a través de `--help`, así que las jerarquías profundas desperdician tokens.
- **Mensajes de error estables.** Frases como "Course not found" y "Authentication expired" son más útiles que códigos de estado HTTP.
- **Códigos de salida que signifiquen algo.** Éxito es 0. Errores de argumentos son una clase, fallos de auth otra, errores de API upstream otra.

Go es un buen lenguaje para este tipo de CLI: binario único estáticamente linkeado, cross-compilation, arranque rápido, sin dependencias de runtime. Los CLIs que mantengo compilan para macOS (ARM e Intel) y Linux (AMD64) desde un solo código base y se despliegan copiando el binario.

## Un binario, dos interfaces

El framing CLI-versus-MCP resulta ser una falsa elección. Puedes entregar un binario que se presente como ambos.

Una librería de Go llamada [ophis](https://github.com/njayp/ophis) recorre el árbol de comandos de Cobra y convierte cada comando en una herramienta MCP. Integrarla en el Canvas CLI tomó 18 líneas:

```go
rootCmd.AddCommand(ophis.Command(&ophis.Config{
    ToolNamePrefix: "canvas",
    Selectors: []ophis.Selector{{
        LocalFlagSelector: ophis.ExcludeFlags("show-token"),
    }},
}))
```

Eso produjo 253 herramientas MCP a partir de los 280+ comandos del CLI. Los flags requeridos se convirtieron en propiedades requeridas del JSON Schema. Los opcionales se mantuvieron opcionales. Las descripciones se heredaron del texto de ayuda de Cobra. Cuando un cliente MCP llama una herramienta, ophis re-invoca el binario con los argumentos reconstruidos. No hay shell involucrada, así que no hay riesgo de injection.

El binario ahora soporta ambos modos:

```bash
# Modo CLI
canvas courses list --instance prod -o json

# Modo MCP
canvas mcp start
```

El CLI mantiene sus ventajas: auth en el keyring, sin credenciales en contexto, salida estructurada. El modo MCP añade discoverability y validación de esquema para los clientes que la prefieren. Mismo binario, mismo modelo de seguridad, sin duplicación.

Cualquier otro CLI basado en Cobra puede recibir el mismo tratamiento. Si tienes un CLI bien estructurado, exponerlo como MCP es una llamada a una librería, no una reescritura.

## Hacia dónde va esto

Empieza con el CLI. Deja que el agente lo use de forma nativa a través de la shell. Envuélvelo como MCP solo cuando un cliente sin acceso a shell pida la superficie del protocolo. Un binario, un modelo de seguridad, nada duplicado.

La capa de enforcement (hooks, linters, tests) mantiene seguro el código escrito por IA dentro del editor. La capa del CLI lo mantiene seguro fuera del editor, en todos los servicios que el agente toque. El siguiente paso, empaquetar todo esto (archivos de contexto, hooks, skills, agentes, CLIs) en una unidad distribuible única, es el post capstone de esta serie.
