---
title: 'Canvas LMS Kit: El SDK Completo de PHP que Esperabas'
description: 'Descubre cómo Canvas LMS Kit simplifica la integración con Canvas API con 45 APIs, soporte OAuth y características listas para producción.'
pubDate: 2025-11-30
author: 'Juan Felipe Rivera González'
tags: ['php', 'canvas-lms', 'sdk', 'api', 'oauth']
cover: '@assets/blog/covers/canvas-lms-kit-introduction-cover.jpg'
coverAlt: 'Visualización técnica moderna mostrando la arquitectura del SDK Canvas LMS Kit con nodos conectados y endpoints de API'
lang: 'es'
translationKey: 'canvas-lms-kit-introduction'
draft: false
featured: true
---

Canvas LMS es un sistema de gestión de aprendizaje potente utilizado por miles de instituciones educativas en todo el mundo. Pero si alguna vez has intentado integrarte con su API directamente, conoces el desafío: flujos de autenticación complejos, manejo manual de paginación, configuración verbosa del cliente HTTP y un sinfín de casos especiales que gestionar.

Después de construir múltiples integraciones con Canvas y resolver repetidamente los mismos problemas, creé **Canvas LMS Kit** - un SDK completo de PHP que transforma las interacciones complejas con la API de Canvas en código simple y elegante. Piensa en él como el Eloquent de Laravel, pero para Canvas LMS.

En esta guía, te mostraré cómo Canvas LMS Kit simplifica la integración con Canvas, desde la configuración básica hasta características avanzadas de producción como autenticación OAuth, suplantación de usuarios y soporte multi-tenant.

## ¿Por Qué Canvas LMS Kit?

### El Desafío de la API de Canvas

Canvas proporciona una API REST completa, pero trabajar con ella directamente implica código repetitivo significativo. Así es como se ve una simple operación de "obtener cursos" sin un SDK:

```php
// La forma antigua: Llamadas directas a la API de Canvas
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://canvas.instructure.com/api/v1/courses',
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    // Manejo manual de errores
    throw new Exception("Solicitud a la API falló: " . $httpCode);
}

$courses = json_decode($response, true);

// Ahora manejar la paginación manualmente analizando los encabezados Link...
// Y implementar rate limiting...
// Y agregar lógica de reintento para fallos transitorios...
// Ya entiendes la idea.
```

Ahora compara eso con el enfoque de Canvas LMS Kit:

```php
// La forma nueva: Canvas LMS Kit
use CanvasLMS\Config;
use CanvasLMS\Api\Courses\Course;

Config::setApiKey('your-api-key');
Config::setBaseUrl('https://canvas.instructure.com');

$courses = Course::get();
```

Eso es todo. Tres líneas para la configuración, una línea para obtener los cursos. El SDK maneja autenticación, paginación, rate limiting, manejo de errores y type safety automáticamente.

### Qué Hace Diferente a Canvas LMS Kit

Canvas LMS Kit no es solo otro wrapper de API. Está construido pensando en las necesidades reales de producción:

- **Patrón Active Record**: Sintaxis intuitiva al estilo Laravel - solo pasa arrays
- **45 APIs de Canvas Implementadas**: Cursos, Usuarios, Assignments, Módulos, Quizzes y más
- **Type Safety**: Declaraciones completas de tipos PHP 8.1+ con aplicación de strict_types
- **Listo para Producción**: OAuth 2.0 integrado, rate limiting, reintentos automáticos y logging PSR-3
- **Eficiente en Memoria**: Tres métodos de paginación para diferentes casos de uso
- **Experiencia del Desarrollador**: 2,300+ tests, documentación completa y mantenimiento activo

Aquí te muestro cómo usarlo.

## Primeros Pasos

### Instalación

Instala Canvas LMS Kit vía Composer:

```bash
composer require jjuanrivvera/canvas-lms-kit
```

**Requisitos:**

- PHP 8.1 o superior
- Composer
- Extensiones PHP: `json`, `curl`, `mbstring`
- Un token de API de Canvas LMS

### Configuración Básica

La configuración más simple requiere solo tu clave API y la URL de tu instancia de Canvas:

```php
use CanvasLMS\Config;

// Autenticación con Clave API
Config::setApiKey('your-canvas-api-key');
Config::setBaseUrl('https://canvas.instructure.com');
Config::setAccountId(1); // Opcional: para operaciones a nivel de cuenta
```

### Configuración Basada en Variables de Entorno (Recomendado)

Para aplicaciones en producción, usa variables de entorno:

```bash
# archivo .env
CANVAS_BASE_URL=https://canvas.instructure.com
CANVAS_API_KEY=your-api-key
CANVAS_ACCOUNT_ID=1
```

Luego auto-detecta la configuración:

```php
// Carga automáticamente desde variables de entorno
Config::autoDetect();

// ¡Listo para usar!
```

Este enfoque sigue los principios de aplicaciones de 12 factores y mantiene las credenciales sensibles fuera de tu código.

## Características Principales en Acción

### Trabajando con Cursos

Canvas LMS Kit usa un patrón Active Record que te resultará familiar si has usado Eloquent de Laravel o ActiveRecord de Ruby on Rails:

```php
use CanvasLMS\Api\Courses\Course;

// Obtener primera página de cursos (predeterminado: 10 por página)
$courses = Course::get();

// Obtener con tamaño de página personalizado
$courses = Course::get(['per_page' => 50]);

// Encontrar un curso específico por ID
$course = Course::find(12345);

// Crear un nuevo curso
$newCourse = Course::create([
    'name' => 'Introducción a PHP',
    'course_code' => 'PHP101',
    'start_at' => '2025-02-01T00:00:00Z'
]);

// Actualizar un curso
$course->update([
    'name' => 'Programación Avanzada en PHP'
]);

// O usar la interfaz fluida
$course->name = 'Nombre de Curso Actualizado';
$course->save();
```

Observa cómo solo pasas arrays - no se requieren DTOs complejos (aunque están disponibles si quieres type safety extra). El SDK maneja las particularidades de la API de Canvas automáticamente.

### Paginación Simplificada

Una de las mejores características de Canvas LMS Kit es cómo maneja la paginación. La API de Canvas pagina casi todo, y el SDK te da tres métodos para manejarlo según tus necesidades:

```php
// Método 1: get() - Solo primera página (rápido, eficiente en memoria)
$courses = Course::get(['per_page' => 20]);

// Método 2: all() - TODAS las páginas obtenidas automáticamente
// ⚠️ Usar con precaución en conjuntos de datos grandes (1000+ elementos)
$allCourses = Course::all();

// Método 3: paginate() - Control total con metadatos
$result = Course::paginate(['per_page' => 50]);

echo "Página {$result->getCurrentPage()} de {$result->getTotalPages()}\n";
echo "Total: {$result->getTotalCount()} cursos\n";

foreach ($result->getData() as $course) {
    echo "{$course->name}\n";
}

// Navegar páginas
if ($result->hasNextPage()) {
    $nextPage = $result->getNextPage();
}
```

**Cuándo usar cada método:**

| Método       | Caso de Uso                                 | Uso de Memoria         | Llamadas API    |
| ------------ | ------------------------------------------- | ---------------------- | --------------- |
| `get()`      | Dashboards, vistas rápidas                  | Bajo (1 página)        | 1               |
| `paginate()` | Tablas UI, procesamiento por lotes          | Bajo (1 página)        | 1 por página    |
| `all()`      | Exportaciones completas, conjuntos pequeños | Alto (todos los datos) | Según necesidad |

Para conjuntos de datos grandes como inscripciones o usuarios, usa el patrón seguro de memoria:

```php
// Procesar miles de inscripciones sin problemas de memoria
$page = 1;
do {
    $batch = Enrollment::paginate(['page' => $page++, 'per_page' => 100]);

    foreach ($batch->getData() as $enrollment) {
        processEnrollment($enrollment); // Tu lógica de procesamiento
    }

    // Opcional: Respetar límites de rate limiting
    if ($batch->hasNextPage()) {
        sleep(1);
    }

} while ($batch->hasNextPage());
```

Este patrón procesa datos en fragmentos, manteniendo el uso de memoria constante independientemente del tamaño total del conjunto de datos.

### Gestionando Assignments y Grading

Trabajar con assignments requiere establecer un contexto de curso. Canvas LMS Kit hace esto de manera directa:

```php
use CanvasLMS\Api\Courses\Course;
use CanvasLMS\Api\Assignments\Assignment;
use CanvasLMS\Api\Submissions\Submission;

// Obtener tu curso y establecer contexto
$course = Course::find(12345);
Assignment::setCourse($course);

// Crear un assignment
$assignment = Assignment::create([
    'name' => 'Proyecto Final',
    'description' => 'Construir una aplicación web completa',
    'points_possible' => 100,
    'due_at' => '2025-03-15T23:59:59Z',
    'submission_types' => ['online_upload', 'online_url']
]);

// Calificar una entrega
Submission::setCourse($course);
Submission::setAssignment($assignment);

$submission = Submission::update($studentId, [
    'posted_grade' => 95,
    'comment' => '¡Excelente trabajo! Código bien estructurado y gran documentación.'
]);
```

La gestión de contexto asegura que el SDK haga solicitudes a los endpoints correctos de Canvas. Una vez establecido, el contexto persiste para todas las operaciones subsiguientes.

## Características Listas para Producción

### Autenticación OAuth 2.0

Mientras que las claves API funcionan para integraciones simples, las aplicaciones en producción a menudo necesitan acceso específico del usuario. Canvas LMS Kit soporta completamente OAuth 2.0 con actualización automática de tokens:

```php
use CanvasLMS\Config;
use CanvasLMS\Auth\OAuth;
use CanvasLMS\Api\Courses\Course;

// Configurar credenciales OAuth
Config::setOAuthClientId('your-client-id');
Config::setOAuthClientSecret('your-client-secret');
Config::setOAuthRedirectUri('https://yourapp.com/oauth/callback');
Config::setBaseUrl('https://canvas.instructure.com');

// Paso 1: Redirigir usuario a Canvas para autorización
$authUrl = OAuth::getAuthorizationUrl([
    'state' => 'token-aleatorio-para-proteccion-csrf'
]);
// Redirigir: header("Location: $authUrl");

// Paso 2: Manejar el callback de OAuth
$tokenData = OAuth::exchangeCode($_GET['code']);
// Guardar $tokenData en tu sesión/base de datos

// Paso 3: Habilitar modo OAuth
Config::useOAuth();

// ¡Ahora todas las llamadas API usan OAuth con actualización automática de token!
$courses = Course::get();
```

El SDK maneja la expiración y actualización de tokens automáticamente. Cuando un token de acceso expira, usa el token de actualización para obtener uno nuevo - completamente transparente para el código de tu aplicación.

### Logging y Monitoreo

Canvas LMS Kit soporta cualquier logger compatible con PSR-3, facilitando la integración con tu infraestructura de logging existente:

```php
use CanvasLMS\Config;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

// Configurar logging
$logger = new Logger('canvas-lms');
$logger->pushHandler(new StreamHandler('logs/canvas.log', Logger::INFO));
Config::setLogger($logger);

// Configurar logging detallado
Config::setMiddleware([
    'logging' => [
        'enabled' => true,
        'log_requests' => true,
        'log_responses' => true,
        'log_timing' => true,
        'sanitize_fields' => ['password', 'token', 'api_key', 'secret']
    ]
]);

// Todas las llamadas API ahora se registran con datos sensibles sanitizados
$course = Course::find(123);
// Logs: "Canvas API Request: GET /api/v1/courses/123"
// Logs: "Canvas API Response: 200 OK (245ms)"
```

**Qué se registra:**

- Todas las solicitudes y respuestas API
- Operaciones de tokens OAuth (actualizar, intercambiar, revocar)
- Operaciones de paginación con métricas de rendimiento
- Progreso de carga de archivos
- Encabezados de rate limiting y costo de API
- Errores con contexto completo

El middleware de logging sanitiza automáticamente campos sensibles como contraseñas, tokens y claves API, previniendo la exposición accidental de credenciales en los logs.

### Suplantación (Actuar Como Usuario)

Los administradores de Canvas pueden realizar operaciones API en nombre de otros usuarios. Canvas LMS Kit hace esto fácil:

```php
use CanvasLMS\Config;
use CanvasLMS\Api\Users\User;
use CanvasLMS\Api\Courses\Course;

// Habilitar suplantación como usuario 12345
Config::asUser(12345);

// Todas las llamadas API ahora incluyen as_user_id=12345
$courses = Course::get();         // Obtener cursos como usuario 12345
$user = User::find(456);
$enrollments = $user->enrollments(); // Obtener inscripciones como usuario 12345

// Detener suplantación
Config::stopMasquerading();

// De vuelta a operaciones normales
$adminCourses = Course::get();
```

**Casos de uso comunes:**

**Operaciones de Soporte:**

```php
// Agente de soporte ayudando a un estudiante a solucionar problemas
Config::asUser($studentId);
$submissions = Assignment::find($assignmentId)->getSubmissions();
Config::stopMasquerading();
```

**Pruebas de Características Basadas en Permisos:**

```php
// Probar cómo diferentes roles experimentan tu integración
foreach ($testUsers as $userId => $role) {
    Config::asUser($userId);
    $canEdit = Course::find($courseId)->canEdit();
    echo "Usuario {$userId} ({$role}): " . ($canEdit ? 'Puede editar' : 'No puede editar') . "\n";
}
Config::stopMasquerading();
```

**Importante:** El usuario autenticado debe tener los permisos apropiados de Canvas para suplantar. Canvas devolverá errores 401/403 si los permisos son insuficientes.

## Capacidades Avanzadas

### Soporte Multi-Tenant

Si estás construyendo una aplicación SaaS que se integra con múltiples instancias de Canvas, la gestión de contexto de Canvas LMS Kit te tiene cubierto:

```php
use CanvasLMS\Config;

// Configurar instancia de Canvas de producción
Config::setContext('production');
Config::setApiKey('prod-api-key');
Config::setBaseUrl('https://prod-canvas.university.edu');

$prodCourses = Course::get();

// Cambiar a instancia de staging
Config::setContext('staging');
Config::setApiKey('staging-api-key');
Config::setBaseUrl('https://staging-canvas.university.edu');

$stagingCourses = Course::get();

// Volver a producción
Config::setContext('production');
$moreProdCourses = Course::get();
```

Cada contexto mantiene su propia configuración, incluyendo claves API, URLs base, tokens OAuth y configuraciones de suplantación.

### Trabajando con Módulos de Curso

Los módulos organizan el contenido del curso jerárquicamente. Así es como crearlos y poblarlos:

```php
use CanvasLMS\Api\Modules\Module;
use CanvasLMS\Api\Modules\ModuleItem;

// Establecer contexto de curso
$course = Course::find(123);
Module::setCourse($course);

// Crear un módulo
$module = Module::create([
    'name' => 'Semana 1: Introducción a la Programación',
    'position' => 1,
    'published' => true
]);

// Agregar elementos al módulo
ModuleItem::setCourse($course);
ModuleItem::setModule($module);

// Agregar un assignment al módulo
$item = ModuleItem::create([
    'title' => 'Assignment Semana 1',
    'type' => 'Assignment',
    'content_id' => $assignment->id,
    'position' => 1,
    'completion_requirement' => [
        'type' => 'must_submit'
    ]
]);
```

### Migraciones de Contenido

¿Necesitas copiar contenido entre cursos? Canvas LMS Kit hace las migraciones sencillas:

```php
use CanvasLMS\Api\ContentMigrations\ContentMigration;

$targetCourse = Course::find(456);

// Copiar todo el contenido de otro curso
$migration = $targetCourse->copyContentFrom(123);

// Copia selectiva con elementos específicos
$migration = $targetCourse->selectiveCopyFrom(123, [
    'assignments' => [1, 2, 3],
    'quizzes' => ['quiz-1', 'quiz-2'],
    'modules' => [10, 11]
]);

// Rastrear progreso de migración
while (!$migration->isCompleted()) {
    $progress = $migration->getProgress();
    echo "Migración {$progress->workflow_state}: {$progress->completion}%\n";
    sleep(5);
    $migration->refresh();
}

echo "¡Migración completada!\n";
```

Esto es particularmente útil para crear plantillas de cursos o transferir contenido a nuevos períodos académicos.

## Cobertura Completa de APIs

Canvas LMS Kit implementa **45 APIs de Canvas**, cubriendo virtualmente todos los escenarios comunes de integración:

**Gestión Principal de Cursos:**

- Cursos, Módulos, Elementos de Módulo, Secciones, Pestañas, Páginas

**Usuarios e Inscripción:**

- Usuarios, Inscripciones, Administradores, Cuentas

**Evaluación y Grading:**

- Assignments, Quizzes, Quiz Submissions
- Submissions, Submission Comments
- Rubrics, Rubric Associations, Rubric Assessments
- Outcomes, Outcome Groups, Outcome Results, Outcome Imports

**Comunicación:**

- Temas de Discusión, Grupos, Categorías de Grupos, Membresías de Grupos
- Conversaciones, Anuncios
- Conferencias

**Herramientas e Integración:**

- Archivos (con soporte de carga en 3 pasos)
- Herramientas Externas (integraciones LTI)
- Eventos de Calendario, Grupos de Citas
- Migraciones de Contenido, Problemas de Migración
- Banderas de Características, Configuraciones de Marca
- Analíticas, Informes de Curso
- Claves de Desarrollador, API de Login
- Marcadores, Objetos Multimedia
- Historial de Libro de Calificaciones

Para la lista completa y documentación detallada, visita el [repositorio GitHub de Canvas LMS Kit](https://github.com/jjuanrivvera/canvas-lms-kit).

## Por Qué Construí Esto

He construido integraciones con Canvas LMS para universidades, escuelas K-12 y empresas EdTech. Cada vez, me encontraba resolviendo los mismos problemas: paginación, rate limiting, flujos de autenticación, gestión de contexto. Cada integración requería cientos de líneas de código repetitivo antes de poder enfocarme en la lógica de negocio real.

Canvas LMS Kit consolida años de experiencia con la API de Canvas en un único SDK bien probado. Es la herramienta que deseaba que existiera cuando comencé a trabajar con Canvas. Al manejar la complejidad de la API de Canvas, permite a los desarrolladores enfocarse en construir grandes características en lugar de luchar con clientes HTTP.

## Comenzando Hoy

¿Listo para simplificar tu integración con Canvas?

### Instalación

```bash
composer require jjuanrivvera/canvas-lms-kit
```

### Recursos

- **Repositorio GitHub**: [github.com/jjuanrivvera/canvas-lms-kit](https://github.com/jjuanrivvera/canvas-lms-kit)
- **Documentación**: [Wiki y Guías](https://github.com/jjuanrivvera/canvas-lms-kit/wiki)
- **Referencia API**: [Documentación API Completa](https://jjuanrivvera.github.io/canvas-lms-kit/)
- **Comunidad**: [Discusiones de GitHub](https://github.com/jjuanrivvera/canvas-lms-kit/discussions)
- **Packagist**: [packagist.org/packages/jjuanrivvera/canvas-lms-kit](https://packagist.org/packages/jjuanrivvera/canvas-lms-kit)

### Ejemplo de Inicio Rápido

```php
<?php

require 'vendor/autoload.php';

use CanvasLMS\Config;
use CanvasLMS\Api\Courses\Course;

// Configurar
Config::setApiKey('your-api-key');
Config::setBaseUrl('https://canvas.instructure.com');

// Usar
$courses = Course::get();

foreach ($courses as $course) {
    echo "Curso: {$course->name} (ID: {$course->id})\n";
}
```

### Contribuyendo

Canvas LMS Kit es de código abierto y se mantiene activamente. Si encuentras bugs, tienes solicitudes de características o quieres contribuir:

- **Reportar Problemas**: [GitHub Issues](https://github.com/jjuanrivvera/canvas-lms-kit/issues)
- **Solicitar Características**: [Formulario de Solicitud de Características](https://github.com/jjuanrivvera/canvas-lms-kit/issues/new?labels=enhancement)
- **Contribuir**: ¡Los pull requests son bienvenidos! Revisa las [Guías de Contribución](https://github.com/jjuanrivvera/canvas-lms-kit/blob/main/CONTRIBUTING.md)

Si encuentras útil este proyecto, considera darle una estrella en GitHub. Ayuda a otros desarrolladores a descubrir el proyecto y motiva el desarrollo continuo.

## Próximos Pasos

Ahora que has visto lo que Canvas LMS Kit puede hacer, aquí hay algunos próximos pasos:

1. **Instala el SDK** y prueba el ejemplo de inicio rápido anterior
2. **Explora la documentación** para descubrir características avanzadas
3. **Revisa los tests** (2,300+ ejemplos) para patrones de uso
4. **Únete a la comunidad** en GitHub Discussions
5. **¡Construye algo increíble** y comparte lo que creas!

Canvas LMS Kit está diseñado para crecer con tus necesidades. Ya sea que estés construyendo una integración simple o una plataforma EdTech multi-tenant compleja, el SDK proporciona la base que necesitas para enfocarte en tu valor único en lugar de la fontanería de la API de Canvas.

¡Feliz programación, y no puedo esperar a ver qué construyes con Canvas LMS Kit!
