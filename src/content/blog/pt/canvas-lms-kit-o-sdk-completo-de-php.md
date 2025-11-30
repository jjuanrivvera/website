---
title: 'Canvas LMS Kit: O SDK Completo de PHP que Esperava'
description: 'Descubra como o Canvas LMS Kit simplifica a integração com a API do Canvas com 45 APIs, suporte OAuth e recursos prontos para produção.'
pubDate: 2025-11-30
author: 'Juan Felipe Rivera González'
tags: ['php', 'canvas-lms', 'sdk', 'api', 'oauth']
cover: '@assets/blog/covers/canvas-lms-kit-introduction-cover.jpg'
coverAlt: 'Visualização técnica moderna mostrando a arquitetura do SDK Canvas LMS Kit com nós conectados e endpoints de API'
lang: 'pt'
translationKey: 'canvas-lms-kit-introduction'
draft: false
featured: true
---

Canvas LMS é um sistema de gerenciamento de aprendizado poderoso usado por milhares de instituições educacionais em todo o mundo. Mas se você já tentou integrar com sua API diretamente, você conhece o desafio: fluxos de autenticação complexos, tratamento manual de paginação, configuração verbosa do cliente HTTP e inúmeros casos especiais para gerenciar.

Depois de construir múltiplas integrações com Canvas e resolver repetidamente os mesmos problemas, criei o **Canvas LMS Kit** - um SDK completo de PHP que transforma interações complexas com a API do Canvas em código simples e elegante. Pense nele como o Eloquent do Laravel, mas para Canvas LMS.

Neste guia, mostrarei como o Canvas LMS Kit simplifica a integração com Canvas, desde a configuração básica até recursos avançados de produção como autenticação OAuth, masquerading e suporte multi-tenant.

## Por Que Canvas LMS Kit?

### O Desafio da API do Canvas

O Canvas fornece uma API REST abrangente, mas trabalhar com ela diretamente envolve código repetitivo significativo. Veja como uma simples operação de "obter cursos" se parece sem um SDK:

```php
// A forma antiga: Chamadas diretas à API do Canvas
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
    // Tratamento manual de erros
    throw new Exception("Requisição à API falhou: " . $httpCode);
}

$courses = json_decode($response, true);

// Agora tratar a paginação manualmente analisando os cabeçalhos Link...
// E implementar rate limiting...
// E adicionar lógica de retry para falhas transitórias...
// Você entendeu a ideia.
```

Agora compare isso com a abordagem do Canvas LMS Kit:

```php
// A nova forma: Canvas LMS Kit
use CanvasLMS\Config;
use CanvasLMS\Api\Courses\Course;

Config::setApiKey('your-api-key');
Config::setBaseUrl('https://canvas.instructure.com');

$courses = Course::get();
```

É isso. Três linhas para configuração, uma linha para buscar cursos. O SDK gerencia autenticação, paginação, rate limiting, tratamento de erros e type safety automaticamente.

### O Que Torna o Canvas LMS Kit Diferente

Canvas LMS Kit não é apenas mais um wrapper de API. Foi construído pensando nas necessidades reais de produção:

- **Padrão Active Record**: Sintaxe intuitiva estilo Laravel - apenas passe arrays
- **45 APIs do Canvas Implementadas**: Courses, Users, Assignments, Modules, Quizzes e mais
- **Type Safety**: Declarações completas de tipos PHP 8.1+ com aplicação de strict_types
- **Pronto para Produção**: OAuth 2.0 integrado, rate limiting, retries automáticos e logging PSR-3
- **Eficiente em Memória**: Três métodos de paginação para diferentes casos de uso
- **Experiência do Desenvolvedor**: 2.300+ testes, documentação abrangente e manutenção ativa

Aqui está como usá-lo.

## Primeiros Passos

### Instalação

Instale o Canvas LMS Kit via Composer:

```bash
composer require jjuanrivvera/canvas-lms-kit
```

**Requisitos:**

- PHP 8.1 ou superior
- Composer
- Extensões PHP: `json`, `curl`, `mbstring`
- Um token de API do Canvas LMS

### Configuração Básica

A configuração mais simples requer apenas sua chave API e a URL da sua instância do Canvas:

```php
use CanvasLMS\Config;

// Autenticação com Chave API
Config::setApiKey('your-canvas-api-key');
Config::setBaseUrl('https://canvas.instructure.com');
Config::setAccountId(1); // Opcional: para operações no nível da conta
```

### Configuração Baseada em Variáveis de Ambiente (Recomendado)

Para aplicações em produção, use variáveis de ambiente:

```bash
# arquivo .env
CANVAS_BASE_URL=https://canvas.instructure.com
CANVAS_API_KEY=your-api-key
CANVAS_ACCOUNT_ID=1
```

Então detecte automaticamente a configuração:

```php
// Carrega automaticamente das variáveis de ambiente
Config::autoDetect();

// Pronto para usar!
```

Esta abordagem segue os princípios de aplicações de 12 fatores e mantém credenciais sensíveis fora do seu código.

## Recursos Principais em Ação

### Trabalhando com Cursos

Canvas LMS Kit usa um padrão Active Record que parecerá familiar se você já usou Eloquent do Laravel ou ActiveRecord do Ruby on Rails:

```php
use CanvasLMS\Api\Courses\Course;

// Obter primeira página de cursos (padrão: 10 por página)
$courses = Course::get();

// Obter com tamanho de página personalizado
$courses = Course::get(['per_page' => 50]);

// Encontrar um curso específico por ID
$course = Course::find(12345);

// Criar um novo curso
$newCourse = Course::create([
    'name' => 'Introdução ao PHP',
    'course_code' => 'PHP101',
    'start_at' => '2025-02-01T00:00:00Z'
]);

// Atualizar um curso
$course->update([
    'name' => 'Programação Avançada em PHP'
]);

// Ou usar a interface fluente
$course->name = 'Nome de Curso Atualizado';
$course->save();
```

Note como você apenas passa arrays - não são necessários DTOs complexos (embora estejam disponíveis se você quiser type safety extra). O SDK gerencia as peculiaridades da API do Canvas automaticamente.

### Paginação Simplificada

Um dos melhores recursos do Canvas LMS Kit é como ele gerencia a paginação. A API do Canvas pagina quase tudo, e o SDK oferece três métodos para lidar com isso de acordo com suas necessidades:

```php
// Método 1: get() - Apenas primeira página (rápido, eficiente em memória)
$courses = Course::get(['per_page' => 20]);

// Método 2: all() - TODAS as páginas buscadas automaticamente
// ⚠️ Use com cautela em conjuntos de dados grandes (1000+ itens)
$allCourses = Course::all();

// Método 3: paginate() - Controle total com metadados
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

**Quando usar cada método:**

| Método       | Caso de Uso                               | Uso de Memória        | Chamadas API        |
| ------------ | ----------------------------------------- | --------------------- | ------------------- |
| `get()`      | Dashboards, visualizações rápidas         | Baixo (1 página)      | 1                   |
| `paginate()` | Tabelas UI, processamento em lote         | Baixo (1 página)      | 1 por página        |
| `all()`      | Exportações completas, conjuntos pequenos | Alto (todos os dados) | Conforme necessário |

Para conjuntos de dados grandes como matrículas ou usuários, use o padrão seguro de memória:

```php
// Processar milhares de matrículas sem problemas de memória
$page = 1;
do {
    $batch = Enrollment::paginate(['page' => $page++, 'per_page' => 100]);

    foreach ($batch->getData() as $enrollment) {
        processEnrollment($enrollment); // Sua lógica de processamento
    }

    // Opcional: Respeitar limites de rate limiting
    if ($batch->hasNextPage()) {
        sleep(1);
    }

} while ($batch->hasNextPage());
```

Este padrão processa dados em pedaços, mantendo o uso de memória constante independentemente do tamanho total do conjunto de dados.

### Gerenciando Assignments e Grading

Trabalhar com assignments requer definir um contexto de curso. Canvas LMS Kit torna isso direto:

```php
use CanvasLMS\Api\Courses\Course;
use CanvasLMS\Api\Assignments\Assignment;
use CanvasLMS\Api\Submissions\Submission;

// Obter seu curso e definir contexto
$course = Course::find(12345);
Assignment::setCourse($course);

// Criar um assignment
$assignment = Assignment::create([
    'name' => 'Projeto Final',
    'description' => 'Construir uma aplicação web completa',
    'points_possible' => 100,
    'due_at' => '2025-03-15T23:59:59Z',
    'submission_types' => ['online_upload', 'online_url']
]);

// Avaliar uma submissão
Submission::setCourse($course);
Submission::setAssignment($assignment);

$submission = Submission::update($studentId, [
    'posted_grade' => 95,
    'comment' => 'Excelente trabalho! Código bem estruturado e ótima documentação.'
]);
```

O gerenciamento de contexto garante que o SDK faça requisições aos endpoints corretos do Canvas. Uma vez definido, o contexto persiste para todas as operações subsequentes.

## Recursos Prontos para Produção

### Autenticação OAuth 2.0

Enquanto chaves API funcionam para integrações simples, aplicações em produção frequentemente precisam de acesso específico do usuário. Canvas LMS Kit suporta completamente OAuth 2.0 com atualização automática de tokens:

```php
use CanvasLMS\Config;
use CanvasLMS\Auth\OAuth;
use CanvasLMS\Api\Courses\Course;

// Configurar credenciais OAuth
Config::setOAuthClientId('your-client-id');
Config::setOAuthClientSecret('your-client-secret');
Config::setOAuthRedirectUri('https://yourapp.com/oauth/callback');
Config::setBaseUrl('https://canvas.instructure.com');

// Passo 1: Redirecionar usuário ao Canvas para autorização
$authUrl = OAuth::getAuthorizationUrl([
    'state' => 'token-aleatorio-para-protecao-csrf'
]);
// Redirecionar: header("Location: $authUrl");

// Passo 2: Tratar o callback OAuth
$tokenData = OAuth::exchangeCode($_GET['code']);
// Armazenar $tokenData na sua sessão/banco de dados

// Passo 3: Habilitar modo OAuth
Config::useOAuth();

// Agora todas as chamadas API usam OAuth com atualização automática de token!
$courses = Course::get();
```

O SDK gerencia expiração e atualização de tokens automaticamente. Quando um token de acesso expira, ele usa o token de atualização para obter um novo - completamente transparente para o código da sua aplicação.

### Logging e Monitoramento

Canvas LMS Kit suporta qualquer logger compatível com PSR-3, facilitando a integração com sua infraestrutura de logging existente:

```php
use CanvasLMS\Config;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

// Configurar logging
$logger = new Logger('canvas-lms');
$logger->pushHandler(new StreamHandler('logs/canvas.log', Logger::INFO));
Config::setLogger($logger);

// Configurar logging detalhado
Config::setMiddleware([
    'logging' => [
        'enabled' => true,
        'log_requests' => true,
        'log_responses' => true,
        'log_timing' => true,
        'sanitize_fields' => ['password', 'token', 'api_key', 'secret']
    ]
]);

// Todas as chamadas API agora são registradas com dados sensíveis sanitizados
$course = Course::find(123);
// Logs: "Canvas API Request: GET /api/v1/courses/123"
// Logs: "Canvas API Response: 200 OK (245ms)"
```

**O que é registrado:**

- Todas as requisições e respostas da API
- Operações de tokens OAuth (atualizar, trocar, revogar)
- Operações de paginação com métricas de desempenho
- Progresso de upload de arquivos
- Cabeçalhos de rate limiting e custo da API
- Erros com contexto completo

O middleware de logging sanitiza automaticamente campos sensíveis como senhas, tokens e chaves API, prevenindo exposição acidental de credenciais nos logs.

### Masquerading (Agir Como Usuário)

Administradores do Canvas podem realizar operações API em nome de outros usuários. Canvas LMS Kit torna isso fácil:

```php
use CanvasLMS\Config;
use CanvasLMS\Api\Users\User;
use CanvasLMS\Api\Courses\Course;

// Habilitar masquerading como usuário 12345
Config::asUser(12345);

// Todas as chamadas API agora incluem as_user_id=12345
$courses = Course::get();         // Obter cursos como usuário 12345
$user = User::find(456);
$enrollments = $user->enrollments(); // Obter matrículas como usuário 12345

// Parar masquerading
Config::stopMasquerading();

// De volta às operações normais
$adminCourses = Course::get();
```

**Casos de uso comuns:**

**Operações de Suporte:**

```php
// Agente de suporte ajudando um estudante a resolver problemas
Config::asUser($studentId);
$submissions = Assignment::find($assignmentId)->getSubmissions();
Config::stopMasquerading();
```

**Testes de Recursos Baseados em Permissões:**

```php
// Testar como diferentes roles experimentam sua integração
foreach ($testUsers as $userId => $role) {
    Config::asUser($userId);
    $canEdit = Course::find($courseId)->canEdit();
    echo "Usuário {$userId} ({$role}): " . ($canEdit ? 'Pode editar' : 'Não pode editar') . "\n";
}
Config::stopMasquerading();
```

**Importante:** O usuário autenticado deve ter permissões apropriadas do Canvas para masquerade. Canvas retornará erros 401/403 se as permissões forem insuficientes.

## Capacidades Avançadas

### Suporte Multi-Tenant

Se você está construindo uma aplicação SaaS que se integra com múltiplas instâncias do Canvas, o gerenciamento de contexto do Canvas LMS Kit tem você coberto:

```php
use CanvasLMS\Config;

// Configurar instância Canvas de produção
Config::setContext('production');
Config::setApiKey('prod-api-key');
Config::setBaseUrl('https://prod-canvas.university.edu');

$prodCourses = Course::get();

// Mudar para instância de staging
Config::setContext('staging');
Config::setApiKey('staging-api-key');
Config::setBaseUrl('https://staging-canvas.university.edu');

$stagingCourses = Course::get();

// Voltar para produção
Config::setContext('production');
$moreProdCourses = Course::get();
```

Cada contexto mantém sua própria configuração, incluindo chaves API, URLs base, tokens OAuth e configurações de masquerading.

### Trabalhando com Módulos de Curso

Módulos organizam o conteúdo do curso hierarquicamente. Veja como criá-los e populá-los:

```php
use CanvasLMS\Api\Modules\Module;
use CanvasLMS\Api\Modules\ModuleItem;

// Definir contexto de curso
$course = Course::find(123);
Module::setCourse($course);

// Criar um módulo
$module = Module::create([
    'name' => 'Semana 1: Introdução à Programação',
    'position' => 1,
    'published' => true
]);

// Adicionar itens ao módulo
ModuleItem::setCourse($course);
ModuleItem::setModule($module);

// Adicionar um assignment ao módulo
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

### Migrações de Conteúdo

Precisa copiar conteúdo entre cursos? Canvas LMS Kit torna as migrações diretas:

```php
use CanvasLMS\Api\ContentMigrations\ContentMigration;

$targetCourse = Course::find(456);

// Copiar todo o conteúdo de outro curso
$migration = $targetCourse->copyContentFrom(123);

// Cópia seletiva com itens específicos
$migration = $targetCourse->selectiveCopyFrom(123, [
    'assignments' => [1, 2, 3],
    'quizzes' => ['quiz-1', 'quiz-2'],
    'modules' => [10, 11]
]);

// Rastrear progresso da migração
while (!$migration->isCompleted()) {
    $progress = $migration->getProgress();
    echo "Migração {$progress->workflow_state}: {$progress->completion}%\n";
    sleep(5);
    $migration->refresh();
}

echo "Migração concluída!\n";
```

Isso é particularmente útil para criar templates de cursos ou transferir conteúdo para novos períodos acadêmicos.

## Cobertura Completa de APIs

Canvas LMS Kit implementa **45 APIs do Canvas**, cobrindo virtualmente todos os cenários comuns de integração:

**Gerenciamento Principal de Cursos:**

- Courses, Modules, Module Items, Sections, Tabs, Pages

**Usuários e Matrícula:**

- Users, Enrollments, Admins, Accounts

**Avaliação e Grading:**

- Assignments, Quizzes, Quiz Submissions
- Submissions, Submission Comments
- Rubrics, Rubric Associations, Rubric Assessments
- Outcomes, Outcome Groups, Outcome Results, Outcome Imports

**Comunicação:**

- Discussion Topics, Groups, Group Categories, Group Memberships
- Conversations, Announcements
- Conferences

**Ferramentas e Integração:**

- Files (com suporte de upload em 3 etapas)
- External Tools (integrações LTI)
- Calendar Events, Appointment Groups
- Content Migrations, Migration Issues
- Feature Flags, Brand Configs
- Analytics, Course Reports
- Developer Keys, Login API
- Bookmarks, MediaObjects
- Gradebook History

Para a lista completa e documentação detalhada, visite o [repositório GitHub do Canvas LMS Kit](https://github.com/jjuanrivvera/canvas-lms-kit).

## Por Que Construí Isto

Construí integrações com Canvas LMS para universidades, escolas K-12 e empresas EdTech. Cada vez, me encontrava resolvendo os mesmos problemas: paginação, rate limiting, fluxos de autenticação, gerenciamento de contexto. Cada integração exigia centenas de linhas de código repetitivo antes que eu pudesse focar na lógica de negócio real.

Canvas LMS Kit consolida anos de experiência com a API do Canvas em um único SDK bem testado. É a ferramenta que eu desejava que existisse quando comecei a trabalhar com Canvas. Ao gerenciar a complexidade da API do Canvas, permite que desenvolvedores foquem em construir ótimos recursos em vez de lutar com clientes HTTP.

## Começando Hoje

Pronto para simplificar sua integração com Canvas?

### Instalação

```bash
composer require jjuanrivvera/canvas-lms-kit
```

### Recursos

- **Repositório GitHub**: [github.com/jjuanrivvera/canvas-lms-kit](https://github.com/jjuanrivvera/canvas-lms-kit)
- **Documentação**: [Wiki e Guias](https://github.com/jjuanrivvera/canvas-lms-kit/wiki)
- **Referência API**: [Documentação API Completa](https://jjuanrivvera.github.io/canvas-lms-kit/)
- **Comunidade**: [Discussões do GitHub](https://github.com/jjuanrivvera/canvas-lms-kit/discussions)
- **Packagist**: [packagist.org/packages/jjuanrivvera/canvas-lms-kit](https://packagist.org/packages/jjuanrivvera/canvas-lms-kit)

### Exemplo de Início Rápido

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

### Contribuindo

Canvas LMS Kit é código aberto e mantido ativamente. Se você encontrar bugs, tiver solicitações de recursos ou quiser contribuir:

- **Reportar Problemas**: [GitHub Issues](https://github.com/jjuanrivvera/canvas-lms-kit/issues)
- **Solicitar Recursos**: [Formulário de Solicitação de Recursos](https://github.com/jjuanrivvera/canvas-lms-kit/issues/new?labels=enhancement)
- **Contribuir**: Pull requests são bem-vindos! Confira as [Diretrizes de Contribuição](https://github.com/jjuanrivvera/canvas-lms-kit/blob/main/CONTRIBUTING.md)

Se você achar este projeto útil, considere dar uma estrela no GitHub. Ajuda outros desenvolvedores a descobrir o projeto e motiva o desenvolvimento contínuo.

## Próximos Passos

Agora que você viu o que o Canvas LMS Kit pode fazer, aqui estão alguns próximos passos:

1. **Instale o SDK** e experimente o exemplo de início rápido acima
2. **Explore a documentação** para descobrir recursos avançados
3. **Confira os testes** (2.300+ exemplos) para padrões de uso
4. **Junte-se à comunidade** nas Discussões do GitHub
5. **Construa algo incrível** e compartilhe o que você criar!

Canvas LMS Kit foi projetado para crescer com suas necessidades. Seja você construindo uma integração simples ou uma plataforma EdTech multi-tenant complexa, o SDK fornece a base que você precisa para focar em seu valor único em vez da infraestrutura da API do Canvas.

Feliz programação, e mal posso esperar para ver o que você constrói com Canvas LMS Kit!
