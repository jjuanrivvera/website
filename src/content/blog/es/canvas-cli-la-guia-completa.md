---
title: 'Canvas CLI: La Guía Completa para Automatización de LMS'
description: 'Domina la automatización de Canvas LMS con Canvas CLI. Aprende instalación, OAuth, operaciones por lotes y flujos de trabajo avanzados.'
pubDate: 2026-01-20
author: 'Juan Felipe Rivera González'
tags: ['go', 'canvas-lms', 'cli', 'automation', 'ai-agents']
cover: '@assets/blog/covers/canvas-cli-guide-cover.jpg'
coverAlt: 'Interfaz de terminal mostrando comandos de Canvas CLI con salida colorida, elementos de diseño inspirados en Go y nodos conectados representando automatización de API'
lang: 'es'
translationKey: 'canvas-cli-guide'
draft: false
featured: true
---

Gestionar Canvas LMS a escala es tedioso y propenso a errores. Administradores haciendo clic en interfaces web, desarrolladores escribiendo peticiones HTTP repetitivas, instructores calificando cientos de entregas manualmente - estas tareas repetitivas drenan productividad e introducen errores humanos.

Con agentes de IA ejecutando tareas desde la terminal, construí **Canvas CLI** - una herramienta para ayudarme a mí y a mis agentes de IA en mi trabajo diario con Canvas LMS. Construido con Claude Code usando la técnica del loop Ralph Wiggum, está diseñado tanto para operadores humanos como para agentes de IA.

En esta guía completa, te llevaré desde la instalación hasta flujos de trabajo de automatización avanzados que pueden ahorrarte horas de trabajo manual.

## ¿Por Qué Usar Canvas CLI para Automatización de LMS?

### El Desafío de la Automatización

Canvas LMS es rico en características, pero automatizarlo tradicionalmente requiere:

1. **Scripts personalizados** - Escribir peticiones HTTP, manejar paginación, gestionar tokens
2. **Herramientas de terceros** - A menudo limitadas en alcance o requiriendo licencias pagas
3. **Trabajo manual** - La interfaz web para todo (no escalable)

### Listo para Agentes de IA: Automatización Segura Sin Exposición de Tokens

Uno de los aspectos más poderosos de Canvas CLI es su compatibilidad con agentes de IA. Asistentes de IA como Claude pueden ejecutar operaciones de Canvas simplemente conociendo cómo usar los comandos del CLI - **sin necesidad de exponer tokens API directamente al LLM**.

El agente hereda los permisos del token autenticado almacenado de forma segura en el keyring de tu sistema, lo que significa:

- **Sin exposición de tokens** - Las credenciales API nunca pasan por el contexto del modelo de IA
- **Permisos heredados** - El agente opera dentro de tu alcance de acceso existente
- **Registro de auditoría** - Todas las operaciones se ejecutan a través del CLI con logging estándar
- **Automatización segura** - La IA puede ayudar a automatizar flujos de trabajo complejos sin riesgos de seguridad
- **Acceso delimitado** - Los permisos del token limitan lo que la IA puede hacer, incluso si se le solicita lo contrario

Esto es fundamentalmente diferente a darle a un agente de IA tokens API crudos, donde las credenciales podrían potencialmente ser registradas, filtradas o mal utilizadas. Con Canvas CLI, la IA solo conoce los comandos - la autenticación es manejada por el keyring seguro de tu sistema.

### Características Principales

- **Binario único multiplataforma** (Linux, macOS, Windows, ARM64)
- **OAuth 2.0 + PKCE seguro** con almacenamiento en keyring del sistema
- **Operaciones masivas desde CSV** (calificaciones, inscripciones)
- **Shell interactivo** con autocompletado con Tab
- **Completaciones de shell** (bash, zsh, fish, PowerShell)
- **Gestión multi-instancia** para dev/staging/producción
- **Listener de webhooks** con verificación JWT
- **Diagnósticos integrados** (`canvas doctor`)
- **Rate limiting adaptativo** y caché de respuestas
- **Salida flexible** como tabla, JSON, YAML o CSV
- **Soporte para masquerading de admin**

### Prácticas de Desarrollo

- 90% de cobertura de tests
- Matriz CI: 3 SO × 2 versiones de Go
- Escaneo de seguridad (govulncheck, gosec)
- 11 linters vía golangci-lint
- Hooks de pre-commit
- Releases y documentación automatizados
- Commits convencionales
- GitHub Action de Claude Code para asistencia en PRs

Código abierto. Escrito en Go.

## Prerequisitos

Antes de instalar Canvas CLI, asegúrate de tener:

### Requisitos del Sistema

- **Sistema Operativo**: Linux, macOS o Windows (amd64 o arm64)
- **Keyring del Sistema**: Disponible para almacenamiento seguro de tokens
  - macOS: Keychain (integrado)
  - Windows: Credential Manager (integrado)
  - Linux: Secret Service (gnome-keyring o kwallet)

### Herramientas Requeridas

- **jq** - Procesador JSON para parsear la salida del CLI en scripts

  ```bash
  # macOS
  brew install jq

  # Ubuntu/Debian
  sudo apt install jq

  # Windows (chocolatey)
  choco install jq
  ```

### Acceso a Canvas LMS

- URL de tu instancia Canvas (ej., `https://tu-escuela.instructure.com`)
- **Para OAuth 2.0**: Acceso de administrador para crear Developer Keys
- **Para tokens API**: Configuración → Integraciones Aprobadas → Nuevo Token de Acceso

## Instalando Canvas CLI

### Homebrew (macOS y Linux)

El método de instalación más fácil usa Homebrew:

```bash
# Agregar el tap
brew tap jjuanrivvera/canvas-cli

# Instalar
brew install canvas-cli

# Verificar instalación
canvas --version
```

### Go Install

Si tienes Go 1.21+ instalado:

```bash
go install github.com/jjuanrivvera/canvas-cli/cmd/canvas@latest
```

### Descarga Directa

Descarga binarios precompilados desde [GitHub Releases](https://github.com/jjuanrivvera/canvas-cli/releases):

- Linux (amd64, arm64)
- macOS (amd64, arm64)
- Windows (amd64, arm64)

## Configuración de Autenticación de Canvas CLI

Canvas CLI soporta dos métodos de autenticación: OAuth 2.0 (recomendado) y tokens API.

### OAuth 2.0 con PKCE (Recomendado)

OAuth 2.0 es más seguro porque:

- Sin tokens de larga duración almacenados en texto plano
- Los tokens pueden revocarse sin regenerar claves API
- Permisos con alcance definido por aplicación
- PKCE previene la interceptación de códigos de autorización

**Paso 1: Registrar una Developer Key en Canvas**

1. Ve a tu instancia de Canvas → Admin → Developer Keys
2. Clic en **+ Developer Key** → **API Key**
3. Configura:
   - **Key Name**: Canvas CLI
   - **Redirect URIs**: `http://localhost:8080/callback`
   - **Enforce Scopes**: Opcional (deja sin marcar para acceso completo)
4. Guarda y anota el **Client ID** y **Client Secret**

**Paso 2: Iniciar Sesión con Canvas CLI**

```bash
# Login interactivo (abre navegador)
canvas auth login https://tu-canvas.instructure.com \
  --client-id TU_CLIENT_ID \
  --client-secret TU_CLIENT_SECRET

# Para sistemas sin interfaz gráfica (entrada manual de código)
canvas auth login https://tu-canvas.instructure.com \
  --client-id TU_CLIENT_ID \
  --client-secret TU_CLIENT_SECRET \
  --mode oob
```

El CLI abre tu navegador para la autorización de Canvas, luego almacena los tokens de forma segura en el keyring del sistema (macOS Keychain, Windows Credential Manager, o Linux Secret Service).

**Paso 3: Verificar Autenticación**

```bash
# Verificar estado de autenticación
canvas auth status

# Probar con un comando simple
canvas users me
```

### Autenticación con Token API

Para configuraciones más simples o sistemas de automatización sin acceso a navegador:

```bash
# Establecer token para una instancia
canvas auth token set produccion \
  --url https://tu-canvas.instructure.com \
  --token TU_TOKEN_API
```

### Autenticación CI/CD

Para GitHub Actions, GitLab CI u otros pipelines:

```bash
# Establecer token vía variable de entorno
export CANVAS_TOKEN="tu-token-api"
export CANVAS_URL="https://tu-canvas.instructure.com"

# O usar el comando token set en tu script CI
canvas auth token set ci \
  --url "$CANVAS_URL" \
  --token "$CANVAS_TOKEN"
```

## Comandos Esenciales de Canvas CLI

### Tabla de Referencia Rápida

| Comando                     | Descripción                 | Ejemplo                                                                                 |
| --------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `canvas courses list`       | Listar tus cursos           | `canvas courses list -o json`                                                           |
| `canvas courses get ID`     | Obtener detalles del curso  | `canvas courses get 12345`                                                              |
| `canvas users me`           | Obtener tu perfil           | `canvas users me`                                                                       |
| `canvas users list`         | Listar usuarios en un curso | `canvas users list --course-id 123`                                                     |
| `canvas assignments list`   | Listar tareas               | `canvas assignments list --course-id 123`                                               |
| `canvas submissions list`   | Listar entregas             | `canvas submissions list --course-id 123 --assignment-id 456`                           |
| `canvas submissions grade`  | Calificar una entrega       | `canvas submissions grade --course-id 123 --assignment-id 456 --user-id 789 --score 95` |
| `canvas enrollments list`   | Listar inscripciones        | `canvas enrollments list --course-id 123`                                               |
| `canvas enrollments create` | Inscribir un usuario        | `canvas enrollments create --course-id 123 --user-id 456`                               |
| `canvas auth status`        | Verificar estado de auth    | `canvas auth status`                                                                    |
| `canvas doctor`             | Ejecutar diagnósticos       | `canvas doctor`                                                                         |

### Explorando Cursos

```bash
# Listar tus cursos
canvas courses list

# Obtener información detallada de un curso
canvas courses get 12345

# Listar con salida personalizada
canvas courses list -o json --limit 50

# Buscar cursos
canvas courses list --search "Introducción a"
```

### Trabajando con Usuarios

```bash
# Obtener tu propio perfil
canvas users me

# Listar usuarios en un curso
canvas users list --course-id 12345

# Buscar un usuario
canvas users list --search "juan.perez@universidad.edu"
```

### Gestionando Tareas

```bash
# Listar tareas en un curso
canvas assignments list --course-id 12345

# Obtener detalles de una tarea
canvas assignments get --course-id 12345 --assignment-id 67890

# Listar entregas para calificar
canvas submissions list --course-id 12345 --assignment-id 67890
```

## Formatos de Salida para Integración con Pipelines

Una de las características más potentes de Canvas CLI es su salida flexible. Esto permite integración perfecta con otras herramientas.

### JSON para APIs y Scripts

```bash
# Perfecto para procesamiento con jq
canvas courses list -o json | jq '.[].name'

# Obtener campos específicos
canvas users me -o json | jq '{id, name, email}'
```

### CSV para Hojas de Cálculo

```bash
# Exportar inscripciones a CSV
canvas enrollments list --course-id 12345 -o csv > inscripciones.csv

# Abrir directamente en Excel/Google Sheets
canvas grades history --course-id 12345 -o csv
```

### YAML para Configuración

```bash
# Exportar estructura del curso
canvas courses get 12345 -o yaml > curso-backup.yaml
```

### Tabla para Lectura Humana

```bash
# Formato por defecto con colores y alineación
canvas courses list -o table
```

## Flujos de Trabajo Avanzados de Automatización con Canvas CLI

Ahora exploremos técnicas avanzadas que pueden ahorrarte horas de trabajo manual. Todos los scripts incluyen manejo de errores apropiado para uso en producción.

### Flujo 1: Gestión Masiva de Inscripciones

**Escenario**: Inscribir 500 estudiantes desde un archivo CSV en un curso.

```bash
#!/bin/bash
# inscripcion-masiva.sh - Inscribir usuarios masivamente desde CSV
set -euo pipefail

COURSE_ID="${1:?Uso: $0 COURSE_ID ARCHIVO_CSV}"
CSV_FILE="${2:?Uso: $0 COURSE_ID ARCHIVO_CSV}"

# Validar prerequisitos
command -v jq >/dev/null 2>&1 || { echo "Error: jq es requerido" >&2; exit 1; }
[[ -f "$CSV_FILE" ]] || { echo "Error: Archivo no encontrado: $CSV_FILE" >&2; exit 1; }

# Formato CSV: email,rol
# juan@uni.edu,student
# maria@uni.edu,ta

exitosos=0
fallidos=0

while IFS=',' read -r email rol; do
  # Saltar encabezado
  [[ "$email" == "email" ]] && continue
  [[ -z "$email" ]] && continue

  # Buscar usuario por email
  user_id=$(canvas users list --search "$email" -o json 2>/dev/null | jq -r '.[0].id // empty')

  if [[ -n "$user_id" ]]; then
    if canvas enrollments create \
      --course-id "$COURSE_ID" \
      --user-id "$user_id" \
      --type "${rol}Enrollment" \
      --state active >/dev/null 2>&1; then
      echo "✓ Inscrito $email como $rol"
      ((exitosos++))
    else
      echo "✗ Error al inscribir $email" >&2
      ((fallidos++))
    fi
  else
    echo "✗ Usuario no encontrado: $email" >&2
    ((fallidos++))
  fi
done < "$CSV_FILE"

echo ""
echo "Resumen: $exitosos inscritos, $fallidos fallidos"
[[ $fallidos -eq 0 ]] || exit 1
```

### Flujo 2: Exportación Automatizada de Calificaciones

**Escenario**: Exportar calificaciones de múltiples cursos en un reporte consolidado.

```bash
#!/bin/bash
# exportar-calificaciones.sh - Exportar calificaciones de todos los cursos activos
set -euo pipefail

OUTPUT_DIR="${1:-./exportaciones-calificaciones}"
mkdir -p "$OUTPUT_DIR"

# Validar prerequisitos
command -v jq >/dev/null 2>&1 || { echo "Error: jq es requerido" >&2; exit 1; }

echo "Obteniendo cursos activos..."
courses=$(canvas courses list -o json | jq -r '.[] | select(.workflow_state=="available") | "\(.id)|\(.name)"')

if [[ -z "$courses" ]]; then
  echo "No se encontraron cursos activos"
  exit 0
fi

exportados=0
while IFS='|' read -r course_id course_name; do
  safe_name=$(echo "$course_name" | tr ' /' '_')
  output_file="$OUTPUT_DIR/${safe_name}_calificaciones.csv"

  echo "Exportando: $course_name..."
  if canvas grades history --course-id "$course_id" -o csv > "$output_file" 2>/dev/null; then
    ((exportados++))
  else
    echo "  Advertencia: No se pudo exportar calificaciones de $course_name" >&2
  fi
done <<< "$courses"

echo ""
echo "Exportados $exportados curso(s) a $OUTPUT_DIR"
```

### Flujo 3: Despliegue de Plantillas de Curso

**Escenario**: Crear múltiples secciones de curso desde una plantilla.

```bash
#!/bin/bash
# desplegar-secciones.sh - Crear secciones de curso desde plantilla
set -euo pipefail

TEMPLATE_COURSE="${1:?Uso: $0 TEMPLATE_COURSE_ID TERM_ID}"
TERM_ID="${2:?Uso: $0 TEMPLATE_COURSE_ID TERM_ID}"
ACCOUNT_ID="${3:-1}"

SECTIONS=("Sección A" "Sección B" "Sección C" "Sección D")

command -v jq >/dev/null 2>&1 || { echo "Error: jq es requerido" >&2; exit 1; }

creados=0
for section in "${SECTIONS[@]}"; do
  echo "Creando: FIS 101 - $section"

  # Crear nuevo curso
  new_course=$(canvas courses create \
    --account-id "$ACCOUNT_ID" \
    --name "FIS 101 - $section" \
    --code "FIS101-${section// /}" \
    --term "$TERM_ID" \
    -o json 2>/dev/null)

  new_id=$(echo "$new_course" | jq -r '.id // empty')

  if [[ -z "$new_id" ]]; then
    echo "  ✗ Error al crear curso" >&2
    continue
  fi

  # Copiar contenido desde plantilla
  if canvas content-migrations create \
    --course-id "$new_id" \
    --source-course-id "$TEMPLATE_COURSE" \
    --type course_copy_importer >/dev/null 2>&1; then
    echo "  ✓ Curso $new_id creado con migración de contenido"
    ((creados++))
  else
    echo "  ✗ Error al iniciar migración de contenido para curso $new_id" >&2
  fi
done

echo ""
echo "Creados $creados de ${#SECTIONS[@]} secciones"
```

### Flujo 4: Calificación por Lotes con Comentarios

**Escenario**: Calificar todas las entregas de una tarea desde un archivo de calificaciones.

```bash
#!/bin/bash
# calificar-lote.sh - Calificar entregas desde CSV
set -euo pipefail

COURSE_ID="${1:?Uso: $0 COURSE_ID ASSIGNMENT_ID GRADES_CSV}"
ASSIGNMENT_ID="${2:?Uso: $0 COURSE_ID ASSIGNMENT_ID GRADES_CSV}"
GRADES_FILE="${3:?Uso: $0 COURSE_ID ASSIGNMENT_ID GRADES_CSV}"

[[ -f "$GRADES_FILE" ]] || { echo "Error: Archivo no encontrado: $GRADES_FILE" >&2; exit 1; }

# Formato CSV: student_id,calificacion,comentario
# 111,95,¡Excelente trabajo!
# 222,78,Buen esfuerzo, revisa la sección 3.

calificados=0
fallidos=0

while IFS=',' read -r student_id calificacion comentario; do
  [[ "$student_id" == "student_id" ]] && continue
  [[ -z "$student_id" ]] && continue

  if canvas submissions grade \
    --course-id "$COURSE_ID" \
    --assignment-id "$ASSIGNMENT_ID" \
    --user-id "$student_id" \
    --score "$calificacion" \
    --comment "$comentario" >/dev/null 2>&1; then
    echo "✓ Calificado estudiante $student_id: $calificacion"
    ((calificados++))
  else
    echo "✗ Error al calificar estudiante $student_id" >&2
    ((fallidos++))
  fi
done < "$GRADES_FILE"

echo ""
echo "Resumen: $calificados calificados, $fallidos fallidos"
[[ $fallidos -eq 0 ]] || exit 1
```

### Flujo 5: Migración de Curso Entre Instancias

**Escenario**: Exportar un curso de staging e importar a producción usando formato Common Cartridge.

```bash
#!/bin/bash
# migrar-curso.sh - Migrar curso entre instancias de Canvas
set -euo pipefail

STAGING_COURSE="${1:?Uso: $0 STAGING_COURSE_ID PROD_COURSE_ID}"
PROD_COURSE="${2:?Uso: $0 STAGING_COURSE_ID PROD_COURSE_ID}"
EXPORT_DIR="${3:-./exportaciones-curso}"

mkdir -p "$EXPORT_DIR"
command -v jq >/dev/null 2>&1 || { echo "Error: jq es requerido" >&2; exit 1; }

echo "Paso 1: Creando exportación de contenido desde staging..."
export_result=$(canvas content-exports create \
  --course-id "$STAGING_COURSE" \
  --instance staging \
  --type common_cartridge \
  -o json 2>/dev/null)

export_id=$(echo "$export_result" | jq -r '.id // empty')
if [[ -z "$export_id" ]]; then
  echo "Error: No se pudo crear la exportación" >&2
  exit 1
fi

echo "  ID de exportación: $export_id"
echo "  Esperando que la exportación termine..."

# Esperar a que termine la exportación
max_attempts=60
attempt=0
while [[ $attempt -lt $max_attempts ]]; do
  status=$(canvas content-exports get \
    --course-id "$STAGING_COURSE" \
    --export-id "$export_id" \
    --instance staging \
    -o json 2>/dev/null | jq -r '.workflow_state // "unknown"')

  if [[ "$status" == "exported" ]]; then
    echo "  ¡Exportación completada!"
    break
  elif [[ "$status" == "failed" ]]; then
    echo "Error: La exportación falló" >&2
    exit 1
  fi

  ((attempt++))
  sleep 5
done

if [[ $attempt -ge $max_attempts ]]; then
  echo "Error: Tiempo de espera agotado" >&2
  exit 1
fi

echo ""
echo "Paso 2: Descargando archivo de exportación..."
download_url=$(canvas content-exports get \
  --course-id "$STAGING_COURSE" \
  --export-id "$export_id" \
  --instance staging \
  -o json 2>/dev/null | jq -r '.attachment.url // empty')

export_file="$EXPORT_DIR/curso-${STAGING_COURSE}-export.imscc"
curl -sL "$download_url" -o "$export_file"
echo "  Descargado a: $export_file"

echo ""
echo "Paso 3: Importando a producción..."
canvas content-migrations create \
  --course-id "$PROD_COURSE" \
  --instance production \
  --type common_cartridge_importer \
  --file "$export_file"

echo ""
echo "¡Migración iniciada! Verifica el estado con:"
echo "  canvas content-migrations list --course-id $PROD_COURSE --instance production"
```

### Flujo 6: Administración de Cursos Asistida por IA con Claude

**Escenario**: Usa Claude Code CLI para gestionar tareas de Canvas de manera inteligente usando lenguaje natural.

Con `claude -p` (modo prompt), puedes aprovechar la IA para analizar datos de Canvas. Envía la salida del CLI directamente a Claude para obtener insights instantáneos:

```bash
# Enviar lista de cursos a Claude para análisis de inscripciones
canvas courses list -o json | claude -p "Analiza estos cursos e identifica
cualquiera con menos de 10 inscripciones. Muestra una tabla resumen con recomendaciones."

# Analizar distribución de calificaciones desde datos enviados
canvas grades history --course-id 12345 -o json | claude -p "Calcula el
promedio, la distribución de calificaciones e identifica estudiantes que necesiten apoyo."

# Auditar tareas con análisis de IA
canvas assignments list --course-id 12345 -o json | claude -p "Identifica
tareas que estén vencidas pero no tengan entregas. Formatea como una lista
de verificación markdown que pueda compartir con el instructor."

# Dejar que Claude ejecute comandos autónomamente para tareas complejas
claude -p "Tengo un archivo CSV en estudiantes.csv con columnas email,rol.
Usa canvas CLI para inscribir estos estudiantes en el curso 12345.
Salta los que ya estén inscritos y reporta los resultados."
```

**Ejemplo: Generación Automatizada de Reporte Semanal**

```bash
#!/bin/bash
# reporte-semanal.sh - Reporte de Canvas generado por IA
set -euo pipefail

COURSE_ID="${1:?Uso: $0 COURSE_ID}"
REPORT_FILE="reporte-canvas-$(date +%Y%m%d).md"

# Usar Claude para generar un reporte inteligente
claude -p "Tienes acceso a canvas CLI. Para el curso $COURSE_ID, por favor:
1. Obtén los detalles del curso
2. Lista las entregas recientes de los últimos 7 días
3. Obtén los conteos de inscripción actuales por rol
4. Identifica cualquier tarea con fecha límite en los próximos 7 días

Genera un reporte markdown bien formateado con:
- Resumen del curso
- Resumen de actividad de entregas
- Desglose de inscripciones
- Fechas límite próximas

Guarda el análisis en un reporte, sé conciso pero completo." > "$REPORT_FILE"

echo "Reporte generado: $REPORT_FILE"
```

**Por Qué CLI + IA Funciona**:

| Acceso Tradicional a API           | Canvas CLI + Agente IA              |
| ---------------------------------- | ----------------------------------- |
| Tokens expuestos al contexto de IA | Tokens en keyring seguro            |
| La IA podría filtrar credenciales  | La IA solo conoce los comandos      |
| Acceso ilimitado a la API          | Delimitado por permisos del token   |
| Sin registro de auditoría          | Logging estándar del CLI            |
| Manejo de errores complejo         | El CLI maneja reintentos/paginación |

## Gestionando Múltiples Instancias de Canvas

Canvas CLI sobresale en gestionar múltiples entornos de Canvas:

```bash
# Agregar instancias
canvas config add produccion \
  --url https://prod.instructure.com \
  --client-id PROD_CLIENT_ID

canvas config add staging \
  --url https://staging.instructure.com \
  --client-id STAGING_CLIENT_ID

# Establecer instancia por defecto
canvas config use produccion

# Sobrescribir por comando
canvas courses list --instance staging

# Verificar configuración actual
canvas config list
```

## Shell REPL Interactivo para Canvas

Para exploración y consultas ad-hoc, el shell REPL es invaluable:

```bash
# Iniciar shell interactivo
canvas shell

# Dentro del shell:
canvas> courses list
canvas> set course_id 12345
canvas> assignments list --course-id $course_id
canvas> history
canvas> help submissions
canvas> exit
```

**Características del REPL:**

- **Historial de comandos** (1000 items) con navegación por flechas
- **Variables de sesión** para almacenar IDs entre comandos
- **Ctrl+R** para búsqueda inversa en historial
- **Autocompletado con Tab** para comandos

## Procesamiento de Eventos de Canvas en Tiempo Real

Canvas CLI incluye un listener de webhooks para automatización en tiempo real:

```bash
# Iniciar listener de webhooks
canvas webhook listen \
  --addr :8080 \
  --secret TU_WEBHOOK_SECRET \
  --events submission_created,grade_change
```

**Casos de uso:**

- Disparar notificaciones cuando se entregan tareas
- Sincronizar calificaciones automáticamente con sistemas externos
- Monitorear cambios de inscripción en tiempo real
- Integrar con Slack/Teams para actualizaciones de cursos

## Consejos de Optimización de Rendimiento de Canvas CLI

### 1. Usa la Limitación de Resultados Sabiamente

```bash
# Obtén solo lo que necesitas
canvas courses list --limit 10

# Para exportaciones grandes, procesa en lotes
canvas enrollments list --course-id 12345 --limit 100 -o csv
```

### 2. Aprovecha el Filtrado JSON con jq

```bash
# Deja que jq haga el trabajo pesado
canvas courses list -o json | jq '[.[] | {id, name}]'

# Filtra del lado del servidor cuando sea posible
canvas assignments list --course-id 12345 --bucket upcoming
```

### 3. Procesamiento Paralelo en Scripts Shell

```bash
# Procesar múltiples cursos en paralelo
courses=$(canvas courses list -o json | jq -r '.[].id')

echo "$courses" | xargs -P 4 -I {} sh -c '
  canvas enrollments list --course-id {} -o csv > inscripciones_{}.csv
'
```

### 4. Entendiendo la Adaptación del Rate Limit

Canvas CLI se adapta automáticamente a los límites de la API:

```text
Cuota > 50%  → 5 peticiones/segundo
Cuota 20-50% → 2 peticiones/segundo
Cuota < 20%  → 1 petición/segundo
```

Para automatización intensiva, considera programar durante horas de baja actividad.

## Solución de Problemas de Canvas CLI

### Problemas Comunes

**Errores de Autenticación:**

```bash
# Verificar estado de autenticación con detalles
canvas auth status -v

# Re-autenticarse
canvas auth logout
canvas auth login https://tu-canvas.instructure.com \
  --client-id TU_CLIENT_ID \
  --client-secret TU_CLIENT_SECRET

# Verificar acceso al keyring
canvas doctor
```

**Rate Limiting:**

```bash
# Verificar estado actual del rate limit
canvas auth status -v

# Agregar delays en scripts
sleep 1  # Entre lotes
```

**Modo Debug:**

```bash
# Habilitar logging detallado
canvas courses list -v

# Verificar configuración
canvas config show

# Ejecutar diagnósticos completos
canvas doctor
```

## Recursos y Herramientas Relacionadas

- **Repositorio GitHub**: [github.com/jjuanrivvera/canvas-cli](https://github.com/jjuanrivvera/canvas-cli)
- **Documentación**: [jjuanrivvera.github.io/canvas-cli](https://jjuanrivvera.github.io/canvas-cli/)
- **Issues y Features**: [GitHub Issues](https://github.com/jjuanrivvera/canvas-cli/issues)

### Ecosistema de Automatización de Canvas

Canvas CLI funciona muy bien junto con:

- **[Canvas LMS Kit](/es/blog/canvas-lms-kit-el-sdk-completo-de-php/)** - SDK PHP para construir integraciones con Canvas y aplicaciones web
- **[Canvas MCP Server](https://github.com/jjuanrivvera/canvas-lms-mcp)** - Servidor Model Context Protocol para asistentes de IA como Claude Desktop. Mientras Canvas CLI es perfecto para agentes de IA basados en terminal (como Claude Code), el servidor MCP permite integración de IA conversacional en interfaces de chat.

## Preguntas Frecuentes

### ¿Qué es Canvas CLI?

Canvas CLI es una herramienta de interfaz de línea de comandos para interactuar con Canvas LMS. Proporciona más de 280 comandos cubriendo todos los endpoints de la API de Canvas, con características como autenticación OAuth 2.0, múltiples formatos de salida y capacidades de procesamiento por lotes.

### ¿Canvas CLI es gratuito y de código abierto?

Sí, Canvas CLI es completamente gratuito y de código abierto bajo la licencia MIT. Puedes ver el código fuente, contribuir y usarlo para cualquier propósito en [github.com/jjuanrivvera/canvas-cli](https://github.com/jjuanrivvera/canvas-cli).

### ¿Cómo instalo Canvas CLI en macOS?

La forma más fácil es usando Homebrew: `brew tap jjuanrivvera/canvas-cli && brew install canvas-cli`. También puedes descargar binarios precompilados desde GitHub Releases o instalar vía `go install` si tienes Go instalado.

### ¿Puedo usar Canvas CLI con asistentes de IA?

¡Sí! Canvas CLI está diseñado para funcionar con agentes de IA como Claude Code. La IA puede ejecutar comandos de Canvas sin acceder directamente a tus tokens API - las credenciales se almacenan de forma segura en el keyring de tu sistema. Usa `claude -p "tu prompt"` para aprovechar la IA en flujos de trabajo complejos de Canvas.

### ¿Canvas CLI funciona con múltiples instancias de Canvas?

Sí, Canvas CLI soporta gestión multi-instancia. Puedes configurar múltiples instancias de Canvas (producción, staging, desarrollo) y cambiar entre ellas usando `canvas config add` y `canvas config use`, o sobrescribir por comando con el flag `--instance`.

## Conclusión

Canvas CLI transforma cómo interactúas con Canvas LMS. Ya sea que gestiones un solo curso o automatices operaciones en múltiples instituciones, el CLI proporciona el poder y flexibilidad que necesitas.

Combinado con agentes de IA como Claude Code, puedes automatizar flujos de trabajo complejos usando lenguaje natural mientras mantienes tus credenciales seguras. El CLI maneja autenticación, rate limiting, paginación y manejo de errores - tú te enfocas en lo que quieres lograr.

Comienza con comandos simples, gradualmente construye scripts de automatización, y antes de que te des cuenta, tareas que tomaban horas se completarán en segundos.

¡Feliz automatización!
