---
title: "Canvas LMS Kit: The Complete PHP SDK You've Awaited"
description: 'Discover how Canvas LMS Kit simplifies Canvas API integration with 45 APIs, OAuth support, and production-ready features. A comprehensive PHP SDK guide.'
pubDate: 2025-11-30
author: 'Juan Felipe Rivera González'
tags: ['php', 'canvas-lms', 'sdk', 'api', 'oauth']
cover: '@assets/blog/covers/canvas-lms-kit-introduction-cover.jpg'
coverAlt: 'Modern technical visualization showing Canvas LMS Kit SDK architecture with connected nodes and API endpoints'
lang: 'en'
translationKey: 'canvas-lms-kit-introduction'
draft: false
featured: true
---

Canvas LMS is a powerful learning management system used by thousands of educational institutions worldwide. But if you've ever tried to integrate with its API directly, you know the challenge: complex authentication flows, manual pagination handling, verbose HTTP client configuration, and countless edge cases to manage.

After building multiple Canvas integrations and repeatedly solving the same problems, I created **Canvas LMS Kit** - a comprehensive PHP SDK that transforms complex Canvas API interactions into simple, elegant code. Think of it as Laravel's Eloquent, but for Canvas LMS.

In this guide, I'll show you how Canvas LMS Kit simplifies Canvas integration, from basic setup to advanced production features like OAuth authentication, masquerading, and multi-tenant support.

## Why Canvas LMS Kit?

### The Canvas API Challenge

Canvas provides a comprehensive REST API, but working with it directly involves significant boilerplate code. Here's what a simple "get courses" operation looks like without an SDK:

```php
// The old way: Direct Canvas API calls
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
    // Manual error handling
    throw new Exception("API request failed: " . $httpCode);
}

$courses = json_decode($response, true);

// Now handle pagination manually by parsing Link headers...
// And implement rate limiting...
// And add retry logic for transient failures...
// You get the idea.
```

Now compare that to the Canvas LMS Kit approach:

```php
// The new way: Canvas LMS Kit
use CanvasLMS\Config;
use CanvasLMS\Api\Courses\Course;

Config::setApiKey('your-api-key');
Config::setBaseUrl('https://canvas.instructure.com');

$courses = Course::get();
```

That's it. Three lines for configuration, one line to fetch courses. The SDK handles authentication, pagination, rate limiting, error handling, and type safety automatically.

### What Makes Canvas LMS Kit Different

Canvas LMS Kit isn't just another API wrapper. It's built with real-world production needs in mind:

- **Active Record Pattern**: Intuitive, Laravel-style syntax - just pass arrays
- **45 Canvas APIs Implemented**: Courses, Users, Assignments, Modules, Quizzes, and more
- **Type Safety**: Full PHP 8.1+ type declarations with strict_types enforcement
- **Production-Ready**: Built-in OAuth 2.0, rate limiting, automatic retries, and PSR-3 logging
- **Memory Efficient**: Three pagination methods for different use cases
- **Developer Experience**: 2,300+ tests, comprehensive documentation, and active maintenance

Here's how to use it.

## Getting Started

### Installation

Install Canvas LMS Kit via Composer:

```bash
composer require jjuanrivvera/canvas-lms-kit
```

**Requirements:**

- PHP 8.1 or higher
- Composer
- PHP extensions: `json`, `curl`, `mbstring`
- A Canvas LMS API token

### Basic Configuration

The simplest setup requires just your API key and Canvas instance URL:

```php
use CanvasLMS\Config;

// API Key Authentication
Config::setApiKey('your-canvas-api-key');
Config::setBaseUrl('https://canvas.instructure.com');
Config::setAccountId(1); // Optional: for account-scoped operations
```

### Environment-Based Configuration (Recommended)

For production applications, use environment variables:

```bash
# .env file
CANVAS_BASE_URL=https://canvas.instructure.com
CANVAS_API_KEY=your-api-key
CANVAS_ACCOUNT_ID=1
```

Then auto-detect the configuration:

```php
// Automatically loads from environment variables
Config::autoDetect();

// You're ready to go!
```

This approach follows 12-factor app principles and keeps sensitive credentials out of your code.

## Core Features in Action

### Working with Courses

Canvas LMS Kit uses an Active Record pattern that will feel familiar if you've used Laravel's Eloquent or ActiveRecord from Ruby on Rails:

```php
use CanvasLMS\Api\Courses\Course;

// Get first page of courses (default: 10 per page)
$courses = Course::get();

// Get with custom page size
$courses = Course::get(['per_page' => 50]);

// Find a specific course by ID
$course = Course::find(12345);

// Create a new course
$newCourse = Course::create([
    'name' => 'Introduction to PHP',
    'course_code' => 'PHP101',
    'start_at' => '2025-02-01T00:00:00Z'
]);

// Update a course
$course->update([
    'name' => 'Advanced PHP Programming'
]);

// Or use the fluent interface
$course->name = 'Updated Course Name';
$course->save();
```

Notice how you just pass arrays - no complex DTOs required (though they're available if you want extra type safety). The SDK handles the Canvas API's quirks automatically.

### Pagination Made Simple

One of Canvas LMS Kit's best features is how it handles pagination. The Canvas API paginates nearly everything, and the SDK gives you three methods to handle it based on your needs:

```php
// Method 1: get() - First page only (fast, memory efficient)
$courses = Course::get(['per_page' => 20]);

// Method 2: all() - ALL pages automatically fetched
// ⚠️ Use with caution on large datasets (1000+ items)
$allCourses = Course::all();

// Method 3: paginate() - Full control with metadata
$result = Course::paginate(['per_page' => 50]);

echo "Page {$result->getCurrentPage()} of {$result->getTotalPages()}\n";
echo "Total: {$result->getTotalCount()} courses\n";

foreach ($result->getData() as $course) {
    echo "{$course->name}\n";
}

// Navigate pages
if ($result->hasNextPage()) {
    $nextPage = $result->getNextPage();
}
```

**When to use each method:**

| Method       | Use Case                         | Memory Usage    | API Calls  |
| ------------ | -------------------------------- | --------------- | ---------- |
| `get()`      | Dashboards, quick views          | Low (1 page)    | 1          |
| `paginate()` | UI tables, batch processing      | Low (1 page)    | 1 per page |
| `all()`      | Complete exports, small datasets | High (all data) | As needed  |

For large datasets like enrollments or users, use the memory-safe pattern:

```php
// Process thousands of enrollments without memory issues
$page = 1;
do {
    $batch = Enrollment::paginate(['page' => $page++, 'per_page' => 100]);

    foreach ($batch->getData() as $enrollment) {
        processEnrollment($enrollment); // Your processing logic
    }

    // Optional: Respect rate limits
    if ($batch->hasNextPage()) {
        sleep(1);
    }

} while ($batch->hasNextPage());
```

This pattern processes data in chunks, keeping memory usage constant regardless of total dataset size.

### Managing Assignments and Grading

Working with assignments requires setting a course context. Canvas LMS Kit makes this straightforward:

```php
use CanvasLMS\Api\Courses\Course;
use CanvasLMS\Api\Assignments\Assignment;
use CanvasLMS\Api\Submissions\Submission;

// Get your course and set context
$course = Course::find(12345);
Assignment::setCourse($course);

// Create an assignment
$assignment = Assignment::create([
    'name' => 'Final Project',
    'description' => 'Build a complete web application',
    'points_possible' => 100,
    'due_at' => '2025-03-15T23:59:59Z',
    'submission_types' => ['online_upload', 'online_url']
]);

// Grade a submission
Submission::setCourse($course);
Submission::setAssignment($assignment);

$submission = Submission::update($studentId, [
    'posted_grade' => 95,
    'comment' => 'Excellent work! Well-structured code and great documentation.'
]);
```

The context management ensures the SDK makes requests to the correct Canvas endpoints. Once set, the context persists for all subsequent operations.

## Production-Ready Features

### OAuth 2.0 Authentication

While API keys work for simple integrations, production applications often need user-specific access. Canvas LMS Kit fully supports OAuth 2.0 with automatic token refresh:

```php
use CanvasLMS\Config;
use CanvasLMS\Auth\OAuth;
use CanvasLMS\Api\Courses\Course;

// Configure OAuth credentials
Config::setOAuthClientId('your-client-id');
Config::setOAuthClientSecret('your-client-secret');
Config::setOAuthRedirectUri('https://yourapp.com/oauth/callback');
Config::setBaseUrl('https://canvas.instructure.com');

// Step 1: Redirect user to Canvas for authorization
$authUrl = OAuth::getAuthorizationUrl([
    'state' => 'random-state-token-for-csrf-protection'
]);
// Redirect: header("Location: $authUrl");

// Step 2: Handle the OAuth callback
$tokenData = OAuth::exchangeCode($_GET['code']);
// Store $tokenData in your session/database

// Step 3: Enable OAuth mode
Config::useOAuth();

// Now all API calls use OAuth with automatic token refresh!
$courses = Course::get();
```

The SDK handles token expiration and refresh automatically. When an access token expires, it uses the refresh token to obtain a new one - completely transparent to your application code.

### Logging and Monitoring

Canvas LMS Kit supports any PSR-3 compatible logger, making it easy to integrate with your existing logging infrastructure:

```php
use CanvasLMS\Config;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

// Setup logging
$logger = new Logger('canvas-lms');
$logger->pushHandler(new StreamHandler('logs/canvas.log', Logger::INFO));
Config::setLogger($logger);

// Configure detailed logging
Config::setMiddleware([
    'logging' => [
        'enabled' => true,
        'log_requests' => true,
        'log_responses' => true,
        'log_timing' => true,
        'sanitize_fields' => ['password', 'token', 'api_key', 'secret']
    ]
]);

// All API calls are now logged with sensitive data sanitized
$course = Course::find(123);
// Logs: "Canvas API Request: GET /api/v1/courses/123"
// Logs: "Canvas API Response: 200 OK (245ms)"
```

**What gets logged:**

- All API requests and responses
- OAuth token operations (refresh, exchange, revoke)
- Pagination operations with performance metrics
- File upload progress
- Rate limit headers and API cost
- Errors with full context

The logging middleware automatically sanitizes sensitive fields like passwords, tokens, and API keys, preventing accidental credential exposure in logs.

### Masquerading (Act As User)

Canvas administrators can perform API operations on behalf of other users. Canvas LMS Kit makes this easy:

```php
use CanvasLMS\Config;
use CanvasLMS\Api\Users\User;
use CanvasLMS\Api\Courses\Course;

// Enable masquerading as user 12345
Config::asUser(12345);

// All API calls now include as_user_id=12345
$courses = Course::get();         // Get courses as user 12345
$user = User::find(456);
$enrollments = $user->enrollments(); // Get enrollments as user 12345

// Stop masquerading
Config::stopMasquerading();

// Back to normal operations
$adminCourses = Course::get();
```

**Common use cases:**

**Support Operations:**

```php
// Support agent helping a student troubleshoot
Config::asUser($studentId);
$submissions = Assignment::find($assignmentId)->getSubmissions();
Config::stopMasquerading();
```

**Testing Permission-Based Features:**

```php
// Test how different roles experience your integration
foreach ($testUsers as $userId => $role) {
    Config::asUser($userId);
    $canEdit = Course::find($courseId)->canEdit();
    echo "User {$userId} ({$role}): " . ($canEdit ? 'Can edit' : 'Cannot edit') . "\n";
}
Config::stopMasquerading();
```

**Important:** The authenticated user must have appropriate Canvas permissions to masquerade. Canvas will return 401/403 errors if permissions are insufficient.

## Advanced Capabilities

### Multi-Tenant Support

If you're building a SaaS application that integrates with multiple Canvas instances, Canvas LMS Kit's context management has you covered:

```php
use CanvasLMS\Config;

// Configure production Canvas instance
Config::setContext('production');
Config::setApiKey('prod-api-key');
Config::setBaseUrl('https://prod-canvas.university.edu');

$prodCourses = Course::get();

// Switch to staging instance
Config::setContext('staging');
Config::setApiKey('staging-api-key');
Config::setBaseUrl('https://staging-canvas.university.edu');

$stagingCourses = Course::get();

// Switch back to production
Config::setContext('production');
$moreProdCourses = Course::get();
```

Each context maintains its own configuration, including API keys, base URLs, OAuth tokens, and masquerading settings.

### Working with Course Modules

Modules organize course content hierarchically. Here's how to create and populate them:

```php
use CanvasLMS\Api\Modules\Module;
use CanvasLMS\Api\Modules\ModuleItem;

// Set course context
$course = Course::find(123);
Module::setCourse($course);

// Create a module
$module = Module::create([
    'name' => 'Week 1: Introduction to Programming',
    'position' => 1,
    'published' => true
]);

// Add items to the module
ModuleItem::setCourse($course);
ModuleItem::setModule($module);

// Add an assignment to the module
$item = ModuleItem::create([
    'title' => 'Week 1 Assignment',
    'type' => 'Assignment',
    'content_id' => $assignment->id,
    'position' => 1,
    'completion_requirement' => [
        'type' => 'must_submit'
    ]
]);
```

### Content Migrations

Need to copy content between courses? Canvas LMS Kit makes migrations straightforward:

```php
use CanvasLMS\Api\ContentMigrations\ContentMigration;

$targetCourse = Course::find(456);

// Copy all content from another course
$migration = $targetCourse->copyContentFrom(123);

// Selective copy with specific items
$migration = $targetCourse->selectiveCopyFrom(123, [
    'assignments' => [1, 2, 3],
    'quizzes' => ['quiz-1', 'quiz-2'],
    'modules' => [10, 11]
]);

// Track migration progress
while (!$migration->isCompleted()) {
    $progress = $migration->getProgress();
    echo "Migration {$progress->workflow_state}: {$progress->completion}%\n";
    sleep(5);
    $migration->refresh();
}

echo "Migration completed!\n";
```

This is particularly useful for templating courses or rolling content forward to new academic terms.

## Comprehensive API Coverage

Canvas LMS Kit implements **45 Canvas APIs**, covering virtually all common integration scenarios:

**Core Course Management:**

- Courses, Modules, Module Items, Sections, Tabs, Pages

**Users & Enrollment:**

- Users, Enrollments, Admins, Accounts

**Assessment & Grading:**

- Assignments, Quizzes, Quiz Submissions
- Submissions, Submission Comments
- Rubrics, Rubric Associations, Rubric Assessments
- Outcomes, Outcome Groups, Outcome Results, Outcome Imports

**Communication:**

- Discussion Topics, Groups, Group Categories, Group Memberships
- Conversations, Announcements
- Conferences

**Tools & Integration:**

- Files (with 3-step upload support)
- External Tools (LTI integrations)
- Calendar Events, Appointment Groups
- Content Migrations, Migration Issues
- Feature Flags, Brand Configs
- Analytics, Course Reports
- Developer Keys, Login API
- Bookmarks, MediaObjects
- Gradebook History

For the complete list and detailed documentation, visit the [Canvas LMS Kit GitHub repository](https://github.com/jjuanrivvera/canvas-lms-kit).

## Why I Built This

I've built Canvas LMS integrations for universities, K-12 schools, and EdTech companies. Every time, I found myself solving the same problems: pagination, rate limiting, authentication flows, context management. Each integration required hundreds of lines of boilerplate code before I could focus on actual business logic.

Canvas LMS Kit consolidates years of Canvas API experience into a single, well-tested SDK. It's the tool I wish existed when I started working with Canvas. By handling the complexity of the Canvas API, it lets developers focus on building great features instead of wrestling with HTTP clients.

## Getting Started Today

Ready to simplify your Canvas integration?

### Installation

```bash
composer require jjuanrivvera/canvas-lms-kit
```

### Resources

- **GitHub Repository**: [github.com/jjuanrivvera/canvas-lms-kit](https://github.com/jjuanrivvera/canvas-lms-kit)
- **Documentation**: [Wiki & Guides](https://github.com/jjuanrivvera/canvas-lms-kit/wiki)
- **API Reference**: [Full API Documentation](https://jjuanrivvera.github.io/canvas-lms-kit/)
- **Community**: [GitHub Discussions](https://github.com/jjuanrivvera/canvas-lms-kit/discussions)
- **Packagist**: [packagist.org/packages/jjuanrivvera/canvas-lms-kit](https://packagist.org/packages/jjuanrivvera/canvas-lms-kit)

### Quick Start Example

```php
<?php

require 'vendor/autoload.php';

use CanvasLMS\Config;
use CanvasLMS\Api\Courses\Course;

// Configure
Config::setApiKey('your-api-key');
Config::setBaseUrl('https://canvas.instructure.com');

// Use
$courses = Course::get();

foreach ($courses as $course) {
    echo "Course: {$course->name} (ID: {$course->id})\n";
}
```

### Contributing

Canvas LMS Kit is open source and actively maintained. If you find bugs, have feature requests, or want to contribute:

- **Report Issues**: [GitHub Issues](https://github.com/jjuanrivvera/canvas-lms-kit/issues)
- **Request Features**: [Feature Request Form](https://github.com/jjuanrivvera/canvas-lms-kit/issues/new?labels=enhancement)
- **Contribute**: Pull requests are welcome! Check the [Contributing Guidelines](https://github.com/jjuanrivvera/canvas-lms-kit/blob/main/CONTRIBUTING.md)

If you find this project useful, consider giving it a star on GitHub. It helps other developers discover the project and motivates continued development.

## Next Steps

Now that you've seen what Canvas LMS Kit can do, here are some next steps:

1. **Install the SDK** and try the quick start example above
2. **Browse the documentation** to explore advanced features
3. **Check out the tests** (2,300+ examples) for usage patterns
4. **Join the community** on GitHub Discussions
5. **Build something awesome** and share what you create!

Canvas LMS Kit is designed to grow with your needs. Whether you're building a simple integration or a complex multi-tenant EdTech platform, the SDK provides the foundation you need to focus on your unique value instead of Canvas API plumbing.

Happy coding, and I can't wait to see what you build with Canvas LMS Kit!
