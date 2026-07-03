export const languages = {
  en: 'English',
  es: 'Español',
  pt: 'Português (Brasil)',
} as const;

export const defaultLang = 'en' as const;

export type Lang = keyof typeof languages;
export type TranslationKey = keyof (typeof ui)['en'];

export const languageMeta = {
  en: { flag: '🇺🇸', code: 'EN', locale: 'en-US' },
  es: { flag: '🇪🇸', code: 'ES', locale: 'es-ES' },
  pt: { flag: '🇧🇷', code: 'PT', locale: 'pt-BR' },
} as const satisfies Record<
  Lang,
  { flag: string; code: string; locale: string }
>;

export const ui = {
  en: {
    // Meta
    'meta.title': 'Juan Felipe Rivera Gonzalez | Full Stack Developer',
    'meta.description':
      'Juan Felipe Rivera Gonzalez - Full Stack Developer with 7+ years of experience in scalable web applications, microservices, and cloud infrastructure.',
    'meta.keywords':
      'Full Stack Developer, PHP, Laravel, Vue.js, AWS, GCP, Node.js, Software Engineer',
    'meta.og.title': 'Juan Felipe Rivera Gonzalez - Full Stack Developer',
    'meta.og.description':
      'Seasoned Full Stack Developer with 7+ years specializing in scalable web applications and cloud infrastructure.',
    'meta.og.imageAlt': 'Juan Felipe Rivera Gonzalez - Full Stack Developer',
    'meta.og.siteName': 'Juan Felipe Rivera Portfolio',

    // Accessibility
    'a11y.skipLink': 'Skip to main content',
    'a11y.toggleMenu': 'Toggle menu',
    'a11y.mobileMenu': 'Mobile navigation',
    'a11y.linkedin': 'LinkedIn profile',
    'a11y.email': 'Send email',
    'a11y.github': 'GitHub profile',
    'a11y.langSwitch': 'Change language',

    // Navigation
    'nav.experience': 'Experience',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.projectsPage': 'All Projects',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',

    // Hero
    'hero.name': 'Juan Felipe Rivera Gonzalez',
    'hero.title': 'Full Stack Developer',
    'hero.description':
      'Seasoned Full Stack Developer with 7+ years of experience specializing in scalable web applications, microservices architecture, and cloud infrastructure. Proven track record delivering enterprise-grade solutions for international clients in fintech and education industries.',
    'hero.imageAlt':
      'Juan Felipe Rivera Gonzalez - Full Stack Developer specializing in PHP, Laravel, Vue.js, AWS, and GCP',
    'hero.cta.contact': 'Get in Touch',
    'hero.cta.experience': 'View Experience',
    'hero.cta.download': 'Download CV',

    // Experience
    'experience.title': 'Professional Experience',
    'experience.subtitle': '7+ years building enterprise solutions',
    'experience.acue.date': 'Jan 2023 - Present',
    'experience.acue.role': 'Full Stack Developer',
    'experience.acue.location': 'New York, United States (Remote)',
    'experience.hellobuild.date': 'Feb 2022 - Dec 2022',
    'experience.hellobuild.role': 'Full Stack Developer',
    'experience.hellobuild.location': 'Florida, United States (Remote)',
    'experience.alegra.date': 'Oct 2019 - Feb 2022',
    'experience.alegra.role': 'Full Stack Developer',
    'experience.alegra.location': 'Medellin, Antioquia, Colombia (Remote)',
    'experience.usc.date': 'Jul 2018 - Sep 2019',
    'experience.usc.role': 'Developer',
    'experience.usc.location': 'Cali, Valle del Cauca, Colombia (On-site)',

    // Skills
    'skills.title': 'Technical Skills',
    'skills.subtitle': 'Core competencies & technologies',
    'skills.frontend': 'Frontend',
    'skills.backend': 'Backend',
    'skills.database': 'Database',
    'skills.cloud': 'Cloud & DevOps',

    // Projects
    'projects.title': 'Featured Projects',
    'projects.subtitle': 'Enterprise solutions & open source contributions',
    'projects.viewAll': 'View All Projects',
    'projects.viewDemo': 'Live Demo',
    'projects.viewCode': 'View Code',
    'projects.featured': 'Featured',

    // Projects Page
    'projectsPage.title': 'Projects',
    'projectsPage.subtitle':
      'A collection of enterprise solutions, open source contributions, and personal projects showcasing my expertise in full-stack development.',
    'projectsPage.metaTitle': 'Projects | Juan Felipe Rivera González',
    'projectsPage.metaDescription':
      'Explore my portfolio of projects including enterprise web applications, open source libraries, microservices, and cloud infrastructure solutions.',

    // Project descriptions
    'projects.nsseWizard.description':
      'Django-based interactive wizard guiding higher education institutions through NSSE (National Survey of Student Engagement) data analysis. Built 8-step guided workflow with session-based progress tracking, dynamic PDF generation with xhtml2pdf, and email delivery via SendGrid. Manages hierarchical content branching across 16 institutional challenges with 73 comprehensive tests.',
    'projects.canvasKit.description':
      'Enterprise-grade open-source PHP library for Canvas LMS API integration with 85% API coverage. Architected using Active Record + DTO patterns with PSR-12 compliance. Achieved 95%+ test coverage with 964 tests and 4,430 assertions.',
    'projects.canvasCli.description':
      'Powerful command-line interface for Canvas LMS built with Go. Features OAuth 2.0 with PKCE authentication, system keyring integration, multi-instance support, adaptive rate limiting, and 280+ commands covering all Canvas LMS resources. Includes interactive REPL mode with command history and completion.',
    'projects.alegraCli.description':
      'Command-line interface for the Alegra accounting API, built with Go and the same architecture as Canvas CLI. Covers most of the API (contacts, items, invoices, payments, bills, reports, and DIAN/SAT electronic invoicing) with OS keyring credential storage and a --dry-run flag on every command. Destructive actions can be locked behind hooks so an AI agent cannot run them, and it ships with a Claude Code skill so agents use it correctly from the first try.',
    'projects.n8nctl.description':
      'Fast, single-binary Go CLI for the n8n workflow-automation API that manages workflows, executions, and credentials across many instances via named profiles with API keys stored in the OS keyring. Treats workflows as code with GitOps apply, lint, diff, and convert, snapshots and promotes workflows across instances (backup, restore, sync), and lets AI agents drive n8n safely through an MCP server, an agent guard, and a lint-enforcing proxy. Distributed via Homebrew and Scoop with cosign-signed releases.',
    'projects.cliwright.description':
      'Spec-gated CLI factory: point it at any REST API and it forges a complete, production-grade Go + Cobra command-line tool — OS keyring auth, named profiles, a resilient client with adaptive rate limiting, an MCP server, an agent guard, CI/CD, and cosign-signed releases with Homebrew and Scoop packaging. It rides the native /goal loop of Claude Code or Codex and drives the build to a deterministic acceptance gate (make verify), so done means provably done, not asserted done. Used to build tgctl and lsqueezy and to harden n8nctl and alegra-cli.',
    'projects.tgctl.description':
      'gh-style command-line tool for the Telegram Bot API, built with Go: send messages and media, manage chats, members, webhooks, and the bot command menu, and poll updates with table/JSON/YAML/CSV output. Supports named profiles for multiple bots with tokens stored in the OS keyring, and ships an MCP server plus an agent guard so AI agents can drive Telegram safely. Distributed via Homebrew and Scoop with signed releases.',
    'projects.tgctlClaudeChannel.description':
      'Claude Code channel that bridges a Telegram bot to a live Claude Code session: drive a persistent agent from your phone with text, polls, buttons, media, reactions, and tool-permission approvals. Implemented as a small MCP stdio server that gates senders through pairing or an allowlist and runs every Telegram operation through the tgctl CLI, so it reimplements no Bot API logic and never holds the token itself.',
    'projects.lsqueezy.description':
      'Production-grade command-line interface for the Lemon Squeezy e-commerce API: stores, products, orders, subscriptions, customers, discounts, license keys, checkouts, and webhooks, scriptable with table/json/yaml/csv output and a --jq filter. Hides the JSON:API envelope behind flat, table-friendly records, stores keys in the OS keyring, retries idempotent requests only, and ships an MCP server for AI agents. Built with the cliwright playbook.',
    'projects.adguardCli.description':
      'The missing command-line interface for AdGuard Home, covering 90%+ of its 81 API operations: clients, blocked services, DNS rewrites, query logs, filters, DHCP, and TLS, all with structured output. Built in Go for homelab operators and anyone who automates DNS infrastructure, with a setup wizard and a doctor command for connectivity diagnostics.',
    'projects.canvasKitLaravel.description':
      'Minimal Laravel integration package for Canvas LMS Kit with zero configuration. Features multi-tenant support for switching between Canvas instances, testing utilities for mocking API calls, and native Laravel integration with config, logging, and testing systems.',
    'projects.financeFlow.description':
      'Comprehensive personal finance management application designed for contractors in Colombia. Features multi-currency tracking, credit card debt optimization, tax calculations, and financial goal planning with React frontend and FastAPI backend.',
    'projects.cvOptimizer.description':
      'AI-powered system using Claude Code to intelligently customize CVs for job applications. Maximizes ATS compatibility while maintaining authenticity by reorganizing and emphasizing existing experience without fabricating information.',
    'projects.todoWizard.description':
      'Modern full-stack task management application with React 18, TypeScript, FastAPI, and PostgreSQL. Features project organization, priorities, tags, markdown support, drag-and-drop ordering, real-time updates, and dark mode.',
    'projects.jwDiscordBot.description':
      'Discord bot providing daily texts, news, and topic search from JW.org. Supports multiple servers with per-server language configuration (Spanish, English, Portuguese), scheduled posts, and MongoDB-backed settings.',
    'projects.dailyTextConverter.description':
      'EPUB to JSON converter for daily text publications with web interface, REST API, and CLI tool. Features real-time progress updates via Server-Sent Events, automatic year detection, and dual parsing strategy with MongoDB storage option.',
    'projects.paymentGateway.description':
      'Microservice enabling users to receive payments through configurable providers including PayPal, RappiPay, Nequi, PayU, Tpaga, SrPago, VisaNet, and MercadoPago.',
    'projects.ecommerceGateway.description':
      'Microservice allowing users to sync their E-commerce platforms with the accounting system. Integrated with Shopify and Mercado Libre marketplaces.',
    'projects.courseBuilder.description':
      "Robust tool for ACUE's Canvas LMS improving course creation efficiency. Introduced centralized workflow, improved error tracking, and eliminated redundant tasks.",
    'projects.acueChatbots.description':
      'AI-powered chatbot platform for ACUE using hybrid RAG search with vector similarity and BM25 keyword matching. Features automated knowledge base ingestion, visual workflow engine with n8n, security guardrails, and multi-bot support powered by Google Vertex AI.',
    'projects.acueCli.description':
      'Unified command-line interface for managing ACUE infrastructure across Cloud Run and VM-based systems. Features multi-environment management, AES-256-GCM encrypted credentials, audit logging, and smart auto-detection with dry-run mode and automatic rollback.',
    'projects.serverlessEvents.description':
      'Innovative solution for handling live events in Canvas LMS using GCP serverless functions. Features JWT decoding, MySQL storage, and Pub/Sub topics for scalable processing.',
    'projects.infraLab.description':
      'Comprehensive homelab spanning Raspberry Pi, VPS, and development workstation with 20+ containerized services. Includes Nginx reverse proxy with 22 SSL-enabled hosts.',
    'projects.portfolio.description':
      'Modern portfolio website built with Astro featuring internationalization (EN/ES/PT), View Transitions for SPA-like navigation, AOS animations, and comprehensive SEO with Open Graph and JSON-LD structured data. Deployed on Netlify with CI/CD.',
    'projects.riveraRefrigeracion.description':
      'Professional website for Rivera Refrigeración, a family-owned appliance repair business in Cali, Colombia with over 30 years of experience. Built with Astro and Tailwind CSS, featuring a blog system, SEO optimization, and WhatsApp integration. Deployed on Netlify.',
    'projects.roperoDeSuenos.description':
      'E-commerce website for Ropero de Sueños, showcasing handcrafted MDF closets for fashion dolls. Features product gallery, testimonials, FAQ section, blog system, and WhatsApp integration for orders. Built with Astro, Tailwind CSS, and Alpine.js.',
    'projects.invitas.description':
      'Self-serve digital invitation SaaS targeting the Spanish-speaking LATAM market. Astro 5 SSR + React 19 islands (Three.js, motion). AI stack on Vertex (Gemini + Imagen 4 Fast) and DeepInfra — in-builder Asistente with patch / undo / image-edit tools, step-by-step creation wizard, inspire prompt, and paste-and-parse guest importer; circuit breaker, cost caps, PII filter, per-tier rate limits. Data-driven payment router via capability matrix: Wompi for COP (card / PSE / Nequi / Bre-B QR) plus Lemon Squeezy internationally, hybrid subscription × per-event model with reconciliation cron and past_due webhook. Feature-flag system (ai / payment / kill-switch / experiment) with admin toggle and audit log. Custom domains via DNS verifier + Traefik auto-TLS. PostgreSQL + Drizzle (forward-only migrations, audit triggers), Better-Auth, R2 storage, @vercel/og share previews, Sentry + Pino observability. 4-layer permissions (auth → role → resource → action) with a capability dictionary and a scoped DB factory that injects the host filter at query time. Vitest (unit) + Playwright (e2e against a Postgres 17 service); pre-commit gate runs lint-staged (ESLint + Prettier), typecheck, and units. Staged CI: typecheck + build + a Drizzle journal monotonic guard → e2e → SSH-triggered deploy on green main. Self-hosted on Coolify.',

    // Education
    'education.title': 'Education',
    'education.subtitle': 'Academic background',
    'education.degree':
      'Technology in Information System Analysis and Development',
    'education.date': 'July 2018',

    // Contact
    'contact.title': 'Get In Touch',
    'contact.subtitle': "Let's work together",
    'contact.heading': 'Ready to collaborate?',
    'contact.description':
      "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.",
    'contact.cta': 'Send Email',

    // Footer
    'footer.languages': 'Languages:',
    'footer.spanish': 'Spanish (Native)',
    'footer.english': 'English (Advanced)',
    'footer.copyright': 'All rights reserved.',

    // Schema
    'schema.jobTitle': 'Full Stack Developer',
    'schema.description':
      'Seasoned Full Stack Developer with 7+ years of experience specializing in scalable web applications, microservices architecture, and cloud infrastructure.',

    // Blog
    'blog.title': 'Blog',
    'blog.description':
      'Articles about web development, software engineering, and technology.',
    'blog.readingTime': 'min read',
    'blog.readMore': 'Read more',
    'blog.readAriaLabel': 'Read',
    'blog.relatedPosts': 'Related Posts',
    'blog.relatedPostsSubtitle': 'You might also like',
    'blog.sharePost': 'Share this post',
    'blog.shareTwitter': 'Share on Twitter',
    'blog.shareFacebook': 'Share on Facebook',
    'blog.shareLinkedIn': 'Share on LinkedIn',
    'blog.shareReddit': 'Share on Reddit',
    'blog.shareEmail': 'Share via Email',
    'blog.toc': 'Table of Contents',
    'blog.tocSubtitle': 'On this page',
    'blog.authorBio': 'About the Author',
    'blog.publishedOn': 'Published on',
    'blog.updatedOn': 'Updated on',
    'blog.tags': 'Tags',
    'blog.taggedWith': 'Tagged with',
    'blog.backToAllPosts': 'Back to all posts',
    'blog.pagination.previous': 'Previous',
    'blog.pagination.next': 'Next',
    'blog.pagination.pageOf': 'Page {current} of {total}',
    'blog.pagination.aria': 'Blog pagination',
    'blog.breadcrumb.home': 'Home',
    'blog.breadcrumb.blog': 'Blog',
    'blog.article': 'article',
    'blog.articles': 'articles',

    // 404
    '404.title': 'Page Not Found',
    '404.description':
      "The page you're looking for doesn't exist or has been moved.",
    '404.cta': 'Go Home',

    // Newsletter
    'newsletter.heading': 'Get new posts in your inbox',
    'newsletter.intro':
      'Practical notes on AI-assisted development, tooling, and the systems behind them. One email when a new post drops, no spam.',
    'newsletter.emailLabel': 'Email address',
    'newsletter.emailPlaceholder': 'you@email.com',
    'newsletter.submit': 'Subscribe',
    'newsletter.hint':
      "You'll get a confirmation email to verify the address. Unsubscribe any time.",
    'newsletter.success':
      'Almost there. Check your inbox for the confirmation email.',
    'newsletter.alreadyMsg': "You're already on the list.",
    'newsletter.error': "Couldn't subscribe. Try again in a moment.",
  },

  es: {
    // Meta
    'meta.title': 'Juan Felipe Rivera Gonzalez | Desarrollador Full Stack',
    'meta.description':
      'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack con más de 7 años de experiencia en aplicaciones web escalables, microservicios e infraestructura en la nube.',
    'meta.keywords':
      'Desarrollador Full Stack, PHP, Laravel, Vue.js, AWS, GCP, Node.js, Ingeniero de Software',
    'meta.og.title': 'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack',
    'meta.og.description':
      'Desarrollador Full Stack experimentado con más de 7 años especializándose en aplicaciones web escalables e infraestructura en la nube.',
    'meta.og.imageAlt':
      'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack',
    'meta.og.siteName': 'Portafolio de Juan Felipe Rivera',

    // Accessibility
    'a11y.skipLink': 'Saltar al contenido principal',
    'a11y.toggleMenu': 'Alternar menú',
    'a11y.mobileMenu': 'Navegación móvil',
    'a11y.linkedin': 'Perfil de LinkedIn',
    'a11y.email': 'Enviar correo electrónico',
    'a11y.github': 'Perfil de GitHub',
    'a11y.langSwitch': 'Cambiar idioma',

    // Navigation
    'nav.experience': 'Experiencia',
    'nav.skills': 'Habilidades',
    'nav.projects': 'Proyectos',
    'nav.projectsPage': 'Todos los Proyectos',
    'nav.education': 'Educación',
    'nav.contact': 'Contacto',
    'nav.blog': 'Blog',

    // Hero
    'hero.name': 'Juan Felipe Rivera Gonzalez',
    'hero.title': 'Desarrollador Full Stack',
    'hero.description':
      'Desarrollador Full Stack experimentado con más de 7 años de experiencia especializándose en aplicaciones web escalables, arquitectura de microservicios e infraestructura en la nube. Historial comprobado entregando soluciones empresariales para clientes internacionales en las industrias fintech y educación.',
    'hero.imageAlt':
      'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack especializado en PHP, Laravel, Vue.js, AWS y GCP',
    'hero.cta.contact': 'Contáctame',
    'hero.cta.experience': 'Ver Experiencia',
    'hero.cta.download': 'Descargar CV',

    // Experience
    'experience.title': 'Experiencia Profesional',
    'experience.subtitle':
      'Más de 7 años construyendo soluciones empresariales',
    'experience.acue.date': 'Ene 2023 - Presente',
    'experience.acue.role': 'Desarrollador Full Stack',
    'experience.acue.location': 'Nueva York, Estados Unidos (Remoto)',
    'experience.hellobuild.date': 'Feb 2022 - Dic 2022',
    'experience.hellobuild.role': 'Desarrollador Full Stack',
    'experience.hellobuild.location': 'Florida, Estados Unidos (Remoto)',
    'experience.alegra.date': 'Oct 2019 - Feb 2022',
    'experience.alegra.role': 'Desarrollador Full Stack',
    'experience.alegra.location': 'Medellín, Antioquia, Colombia (Remoto)',
    'experience.usc.date': 'Jul 2018 - Sep 2019',
    'experience.usc.role': 'Desarrollador',
    'experience.usc.location': 'Cali, Valle del Cauca, Colombia (Presencial)',

    // Skills
    'skills.title': 'Habilidades Técnicas',
    'skills.subtitle': 'Competencias y tecnologías principales',
    'skills.frontend': 'Frontend',
    'skills.backend': 'Backend',
    'skills.database': 'Base de Datos',
    'skills.cloud': 'Nube y DevOps',

    // Projects
    'projects.title': 'Proyectos Destacados',
    'projects.subtitle':
      'Soluciones empresariales y contribuciones de código abierto',
    'projects.viewAll': 'Ver Todos los Proyectos',
    'projects.viewDemo': 'Demo en Vivo',
    'projects.viewCode': 'Ver Código',
    'projects.featured': 'Destacado',

    // Projects Page
    'projectsPage.title': 'Proyectos',
    'projectsPage.subtitle':
      'Una colección de soluciones empresariales, contribuciones de código abierto y proyectos personales que demuestran mi experiencia en desarrollo full-stack.',
    'projectsPage.metaTitle': 'Proyectos | Juan Felipe Rivera González',
    'projectsPage.metaDescription':
      'Explora mi portafolio de proyectos que incluye aplicaciones web empresariales, bibliotecas de código abierto, microservicios y soluciones de infraestructura en la nube.',

    // Project descriptions
    'projects.nsseWizard.description':
      'Asistente interactivo basado en Django que guía a instituciones de educación superior a través del análisis de datos NSSE (National Survey of Student Engagement). Desarrollé un flujo de trabajo guiado de 8 pasos con seguimiento de progreso basado en sesiones, generación dinámica de PDF con xhtml2pdf y entrega de correos vía SendGrid. Gestiona ramificación jerárquica de contenido a través de 16 desafíos institucionales con 73 pruebas exhaustivas.',
    'projects.canvasKit.description':
      'Biblioteca PHP de código abierto de nivel empresarial para integración con la API de Canvas LMS con 85% de cobertura de API. Arquitectura usando patrones Active Record + DTO con cumplimiento PSR-12. Logré más del 95% de cobertura de pruebas con 964 tests y 4,430 aserciones.',
    'projects.canvasCli.description':
      'Potente interfaz de línea de comandos para Canvas LMS construida con Go. Incluye autenticación OAuth 2.0 con PKCE, integración con keyring del sistema, soporte multi-instancia, limitación de tasa adaptativa y más de 280 comandos. Modo REPL interactivo con historial y autocompletado.',
    'projects.alegraCli.description':
      'Interfaz de línea de comandos para la API de contabilidad de Alegra, construida con Go y la misma arquitectura de Canvas CLI. Cubre casi toda la API (contactos, productos, facturas, pagos, gastos, reportes y facturación electrónica DIAN/SAT) con credenciales cifradas en el keyring del sistema operativo y un flag --dry-run en cualquier comando. Las acciones destructivas se pueden restringir con hooks para que un agente de IA no pueda ejecutarlas, e incluye una skill de Claude Code para que los agentes la usen bien desde el primer intento.',
    'projects.n8nctl.description':
      'CLI en Go de un solo binario y muy rápida para la API de automatización de flujos de n8n, que gestiona flujos, ejecuciones y credenciales en muchas instancias mediante perfiles con nombre y llaves de API guardadas en el keyring del sistema operativo. Trata los flujos como código con GitOps (apply, lint, diff y convert), toma snapshots y promueve flujos entre instancias (backup, restore, sync), y permite que agentes de IA operen n8n de forma segura mediante un servidor MCP, un guard de agentes y un proxy que exige lint. Se distribuye con Homebrew y Scoop con releases firmados con cosign.',
    'projects.cliwright.description':
      'Fábrica de CLIs con spec y gate: apúntala a cualquier API REST y forja una herramienta de línea de comandos completa y de nivel de producción en Go + Cobra — autenticación en el keyring del sistema, perfiles con nombre, cliente resiliente con limitación de tasa adaptativa, servidor MCP, guard de agentes, CI/CD y releases firmados con cosign, empaquetados para Homebrew y Scoop. Usa el loop /goal nativo de Claude Code o Codex y lleva la construcción hasta un gate de aceptación determinista (make verify), así que terminado significa probadamente terminado, no simplemente afirmado. Con ella se construyeron tgctl y lsqueezy, y se endurecieron n8nctl y alegra-cli.',
    'projects.tgctl.description':
      'Herramienta de línea de comandos al estilo gh para la Bot API de Telegram, construida con Go: envía mensajes y multimedia, gestiona chats, miembros, webhooks y el menú de comandos del bot, y consulta updates con salida en tabla/JSON/YAML/CSV. Soporta perfiles con nombre para varios bots con tokens guardados en el keyring del sistema operativo, e incluye un servidor MCP y un guard de agentes para que agentes de IA operen Telegram de forma segura. Se distribuye con Homebrew y Scoop con releases firmados.',
    'projects.tgctlClaudeChannel.description':
      'Canal de Claude Code que conecta un bot de Telegram con una sesión de Claude Code en vivo: maneja un agente persistente desde el teléfono con texto, encuestas, botones, multimedia, reacciones y aprobaciones de permisos de herramientas. Implementado como un pequeño servidor MCP stdio que filtra remitentes mediante emparejamiento o lista de permitidos y ejecuta cada operación de Telegram a través de la CLI tgctl, así que no reimplementa lógica de la Bot API y nunca guarda el token.',
    'projects.lsqueezy.description':
      'Interfaz de línea de comandos de nivel de producción para la API de e-commerce de Lemon Squeezy: tiendas, productos, órdenes, suscripciones, clientes, descuentos, llaves de licencia, checkouts y webhooks, automatizable con salida en tabla/json/yaml/csv y un filtro --jq. Esconde el sobre JSON:API detrás de registros planos listos para tablas, guarda las llaves en el keyring del sistema, reintenta solo peticiones idempotentes e incluye un servidor MCP para agentes de IA. Construida con el playbook de cliwright.',
    'projects.adguardCli.description':
      'La interfaz de línea de comandos que le faltaba a AdGuard Home: cubre más del 90% de sus 81 operaciones de API — clientes, servicios bloqueados, reescrituras DNS, logs de consultas, filtros, DHCP y TLS, todo con salida estructurada. Construida en Go para operadores de homelab y cualquiera que automatice su infraestructura DNS, con un asistente de configuración y un comando doctor para diagnósticos de conectividad.',
    'projects.canvasKitLaravel.description':
      'Paquete de integración Laravel mínimo para Canvas LMS Kit con configuración cero. Soporte multi-tenant para cambiar entre instancias de Canvas, utilidades de pruebas para simular llamadas API e integración nativa con config, logging y testing de Laravel.',
    'projects.financeFlow.description':
      'Aplicación integral de gestión de finanzas personales diseñada para contratistas en Colombia. Incluye seguimiento multi-moneda, optimización de deuda de tarjetas de crédito, cálculos de impuestos y planificación de metas financieras con frontend React y backend FastAPI.',
    'projects.cvOptimizer.description':
      'Sistema impulsado por IA usando Claude Code para personalizar CVs inteligentemente para aplicaciones de trabajo. Maximiza compatibilidad con ATS manteniendo autenticidad al reorganizar y enfatizar experiencia existente sin fabricar información.',
    'projects.todoWizard.description':
      'Aplicación moderna de gestión de tareas full-stack con React 18, TypeScript, FastAPI y PostgreSQL. Incluye organización por proyectos, prioridades, etiquetas, soporte markdown, ordenamiento drag-and-drop, actualizaciones en tiempo real y modo oscuro.',
    'projects.jwDiscordBot.description':
      'Bot de Discord que proporciona textos diarios, noticias y búsqueda de temas de JW.org. Soporta múltiples servidores con configuración de idioma por servidor (español, inglés, portugués), publicaciones programadas y configuración respaldada por MongoDB.',
    'projects.dailyTextConverter.description':
      'Convertidor de EPUB a JSON para publicaciones de texto diario con interfaz web, API REST y herramienta CLI. Incluye actualizaciones de progreso en tiempo real vía Server-Sent Events, detección automática de año y estrategia de parseo dual con opción de almacenamiento MongoDB.',
    'projects.paymentGateway.description':
      'Microservicio que permite a los usuarios recibir pagos a través de proveedores configurables incluyendo PayPal, RappiPay, Nequi, PayU, Tpaga, SrPago, VisaNet y MercadoPago.',
    'projects.ecommerceGateway.description':
      'Microservicio que permite a los usuarios sincronizar sus plataformas de comercio electrónico con el sistema contable. Integrado con Shopify y Mercado Libre.',
    'projects.courseBuilder.description':
      'Herramienta robusta para el Canvas LMS de ACUE que mejora la eficiencia en la creación de cursos. Introduje flujo de trabajo centralizado, seguimiento de errores mejorado y eliminación de tareas redundantes.',
    'projects.acueChatbots.description':
      'Plataforma de chatbots impulsada por IA para ACUE usando búsqueda RAG híbrida con similitud vectorial y coincidencia de palabras clave BM25. Incluye ingesta automatizada de base de conocimiento, motor de flujos de trabajo visual con n8n, guardas de seguridad y soporte multi-bot con Google Vertex AI.',
    'projects.acueCli.description':
      'Interfaz de línea de comandos unificada para gestionar la infraestructura de ACUE en sistemas Cloud Run y basados en VM. Incluye gestión multi-entorno, credenciales cifradas con AES-256-GCM, registro de auditoría y auto-detección con modo dry-run y rollback automático.',
    'projects.serverlessEvents.description':
      'Solución innovadora para manejar eventos en vivo en Canvas LMS usando funciones serverless de GCP. Incluye decodificación JWT, almacenamiento MySQL y topics Pub/Sub para procesamiento escalable.',
    'projects.infraLab.description':
      'Laboratorio completo que abarca Raspberry Pi, VPS y estación de trabajo de desarrollo con más de 20 servicios en contenedores. Incluye proxy reverso Nginx con 22 hosts habilitados para SSL.',
    'projects.portfolio.description':
      'Sitio web de portafolio moderno construido con Astro con internacionalización (EN/ES/PT), View Transitions para navegación tipo SPA, animaciones AOS y SEO completo con Open Graph y datos estructurados JSON-LD. Desplegado en Netlify con CI/CD.',
    'projects.riveraRefrigeracion.description':
      'Sitio web profesional para Rivera Refrigeración, un negocio familiar de reparación de electrodomésticos en Cali, Colombia con más de 30 años de experiencia. Construido con Astro y Tailwind CSS, con sistema de blog, optimización SEO e integración con WhatsApp. Desplegado en Netlify.',
    'projects.roperoDeSuenos.description':
      'Sitio web de comercio electrónico para Ropero de Sueños, mostrando closets artesanales de MDF para muñecas de moda. Incluye galería de productos, testimonios, sección de preguntas frecuentes, sistema de blog e integración con WhatsApp para pedidos. Construido con Astro, Tailwind CSS y Alpine.js.',
    'projects.invitas.description':
      'SaaS self-serve de invitaciones digitales para el mercado hispanohablante de LATAM. Astro 5 SSR + islas React 19 (Three.js, motion). Stack de IA sobre Vertex (Gemini + Imagen 4 Fast) y DeepInfra — Asistente in-builder con herramientas de patch / undo / edición de imagen, wizard guiado de creación, prompt de inspiración e importador de invitados (pegar texto → parseo a filas); circuit breaker, topes de costo, filtro PII y rate limits por tier. Payment router data-driven con matriz de capacidades: Wompi para COP (tarjeta / PSE / Nequi / Bre-B QR) más Lemon Squeezy internacional, modelo híbrido suscripción × por evento con cron de reconciliación y webhook past_due. Sistema de feature flags (ai / payment / kill-switch / experimento) con admin toggle y audit log. Dominios propios vía DNS verifier + TLS automático con Traefik. PostgreSQL + Drizzle (migraciones forward-only, triggers de auditoría), Better-Auth, almacenamiento en R2, share previews con @vercel/og, observabilidad con Sentry + Pino. Permisos de 4 capas (auth → role → resource → action) con capability dictionary y un DB factory scoped que inyecta el filtro de host a nivel de query. Vitest (unit) + Playwright (e2e contra un servicio Postgres 17); el pre-commit corre lint-staged (ESLint + Prettier), typecheck y unit tests. CI por etapas: typecheck + build + guard de monotonicidad del journal de Drizzle → e2e → deploy disparado por SSH en main verde. Self-hosted en Coolify.',

    // Education
    'education.title': 'Educación',
    'education.subtitle': 'Formación académica',
    'education.degree':
      'Tecnología en Análisis y Desarrollo de Sistemas de Información',
    'education.date': 'Julio 2018',

    // Contact
    'contact.title': 'Ponte en Contacto',
    'contact.subtitle': 'Trabajemos juntos',
    'contact.heading': '¿Listo para colaborar?',
    'contact.description':
      'Siempre estoy abierto a discutir nuevos proyectos, ideas creativas u oportunidades para ser parte de tu visión.',
    'contact.cta': 'Enviar Email',

    // Footer
    'footer.languages': 'Idiomas:',
    'footer.spanish': 'Español (Nativo)',
    'footer.english': 'Inglés (Avanzado)',
    'footer.copyright': 'Todos los derechos reservados.',

    // Schema
    'schema.jobTitle': 'Desarrollador Full Stack',
    'schema.description':
      'Desarrollador Full Stack experimentado con más de 7 años de experiencia especializándose en aplicaciones web escalables, arquitectura de microservicios e infraestructura en la nube.',

    // Blog
    'blog.title': 'Blog',
    'blog.description':
      'Artículos sobre desarrollo web, ingeniería de software y tecnología.',
    'blog.readingTime': 'min de lectura',
    'blog.readMore': 'Leer más',
    'blog.readAriaLabel': 'Leer',
    'blog.relatedPosts': 'Artículos Relacionados',
    'blog.relatedPostsSubtitle': 'También te puede interesar',
    'blog.sharePost': 'Compartir este artículo',
    'blog.shareTwitter': 'Compartir en Twitter',
    'blog.shareFacebook': 'Compartir en Facebook',
    'blog.shareLinkedIn': 'Compartir en LinkedIn',
    'blog.shareReddit': 'Compartir en Reddit',
    'blog.shareEmail': 'Compartir por Email',
    'blog.toc': 'Tabla de Contenidos',
    'blog.tocSubtitle': 'En esta página',
    'blog.authorBio': 'Sobre el Autor',
    'blog.publishedOn': 'Publicado el',
    'blog.updatedOn': 'Actualizado el',
    'blog.tags': 'Etiquetas',
    'blog.taggedWith': 'Etiquetado con',
    'blog.backToAllPosts': 'Volver a todos los artículos',
    'blog.pagination.previous': 'Anterior',
    'blog.pagination.next': 'Siguiente',
    'blog.pagination.pageOf': 'Página {current} de {total}',
    'blog.pagination.aria': 'Paginación del blog',
    'blog.breadcrumb.home': 'Inicio',
    'blog.breadcrumb.blog': 'Blog',
    'blog.article': 'artículo',
    'blog.articles': 'artículos',

    // 404
    '404.title': 'Página No Encontrada',
    '404.description': 'La página que buscas no existe o ha sido movida.',
    '404.cta': 'Ir al Inicio',

    // Newsletter
    'newsletter.heading': 'Recibe los nuevos posts en tu bandeja',
    'newsletter.intro':
      'Notas prácticas sobre desarrollo asistido por IA, herramientas y los sistemas detrás. Un email cuando sale un post nuevo, sin spam.',
    'newsletter.emailLabel': 'Correo electrónico',
    'newsletter.emailPlaceholder': 'tu@email.com',
    'newsletter.submit': 'Suscribirme',
    'newsletter.hint':
      'Recibirás un email para confirmar la dirección. Te puedes desuscribir cuando quieras.',
    'newsletter.success':
      'Casi listo. Revisa tu inbox para el email de confirmación.',
    'newsletter.alreadyMsg': 'Ya estás en la lista.',
    'newsletter.error': 'No se pudo suscribir. Probá de nuevo en un momento.',
  },
  pt: {
    // Meta
    'meta.title': 'Juan Felipe Rivera Gonzalez | Desenvolvedor Full Stack',
    'meta.description':
      'Juan Felipe Rivera Gonzalez - Desenvolvedor Full Stack com mais de 7 anos de experiência em aplicações web escaláveis, microserviços e infraestrutura em nuvem.',
    'meta.keywords':
      'Desenvolvedor Full Stack, PHP, Laravel, Vue.js, AWS, GCP, Node.js, Engenheiro de Software',
    'meta.og.title': 'Juan Felipe Rivera Gonzalez - Desenvolvedor Full Stack',
    'meta.og.description':
      'Desenvolvedor Full Stack experiente com mais de 7 anos focado em aplicações escaláveis e infraestrutura em nuvem.',
    'meta.og.imageAlt':
      'Juan Felipe Rivera Gonzalez - Desenvolvedor Full Stack',
    'meta.og.siteName': 'Portfólio de Juan Felipe Rivera',

    // Accessibility
    'a11y.skipLink': 'Pular para o conteúdo principal',
    'a11y.toggleMenu': 'Alternar menu',
    'a11y.mobileMenu': 'Navegação móvel',
    'a11y.linkedin': 'Perfil no LinkedIn',
    'a11y.email': 'Enviar e-mail',
    'a11y.github': 'Perfil no GitHub',
    'a11y.langSwitch': 'Mudar idioma',

    // Navigation
    'nav.experience': 'Experiência',
    'nav.skills': 'Habilidades',
    'nav.projects': 'Projetos',
    'nav.projectsPage': 'Todos os Projetos',
    'nav.education': 'Educação',
    'nav.contact': 'Contato',
    'nav.blog': 'Blog',

    // Hero
    'hero.name': 'Juan Felipe Rivera Gonzalez',
    'hero.title': 'Desenvolvedor Full Stack',
    'hero.description':
      'Desenvolvedor Full Stack experiente com mais de 7 anos especializado em aplicações web escaláveis, arquitetura de microserviços e infraestrutura em nuvem. Histórico comprovado entregando soluções de nível empresarial para clientes internacionais nos setores financeiro e educacional.',
    'hero.imageAlt':
      'Juan Felipe Rivera Gonzalez - Desenvolvedor Full Stack especializado em PHP, Laravel, Vue.js, AWS e GCP',
    'hero.cta.contact': 'Entrar em Contato',
    'hero.cta.experience': 'Ver Experiência',
    'hero.cta.download': 'Baixar CV',

    // Experience
    'experience.title': 'Experiência Profissional',
    'experience.subtitle': 'Mais de 7 anos construindo soluções empresariais',
    'experience.acue.date': 'Jan 2023 - Presente',
    'experience.acue.role': 'Desenvolvedor Full Stack',
    'experience.acue.location': 'Nova York, Estados Unidos (Remoto)',
    'experience.hellobuild.date': 'Fev 2022 - Dez 2022',
    'experience.hellobuild.role': 'Desenvolvedor Full Stack',
    'experience.hellobuild.location': 'Flórida, Estados Unidos (Remoto)',
    'experience.alegra.date': 'Out 2019 - Fev 2022',
    'experience.alegra.role': 'Desenvolvedor Full Stack',
    'experience.alegra.location': 'Medellín, Antioquia, Colômbia (Remoto)',
    'experience.usc.date': 'Jul 2018 - Set 2019',
    'experience.usc.role': 'Desenvolvedor',
    'experience.usc.location': 'Cali, Valle del Cauca, Colômbia (Presencial)',

    // Skills
    'skills.title': 'Habilidades Técnicas',
    'skills.subtitle': 'Competências essenciais e tecnologias',
    'skills.frontend': 'Frontend',
    'skills.backend': 'Backend',
    'skills.database': 'Banco de Dados',
    'skills.cloud': 'Nuvem & DevOps',

    // Projects
    'projects.title': 'Projetos em Destaque',
    'projects.subtitle': 'Soluções empresariais e contribuições open source',
    'projects.viewAll': 'Ver Todos os Projetos',
    'projects.viewDemo': 'Demo ao Vivo',
    'projects.viewCode': 'Ver Código',
    'projects.featured': 'Destaque',

    // Projects Page
    'projectsPage.title': 'Projetos',
    'projectsPage.subtitle':
      'Uma coleção de soluções empresariais, contribuições open source e projetos pessoais demonstrando minha expertise em desenvolvimento full-stack.',
    'projectsPage.metaTitle': 'Projetos | Juan Felipe Rivera González',
    'projectsPage.metaDescription':
      'Explore meu portfólio de projetos incluindo aplicações web empresariais, bibliotecas open source, microserviços e soluções de infraestrutura em nuvem.',

    // Project descriptions
    'projects.nsseWizard.description':
      'Assistente interativo baseado em Django que orienta instituições de ensino superior através da análise de dados NSSE (National Survey of Student Engagement). Desenvolvi um fluxo de trabalho guiado de 8 etapas com rastreamento de progresso baseado em sessão, geração dinâmica de PDF com xhtml2pdf e entrega de e-mail via SendGrid. Gerencia ramificação hierárquica de conteúdo através de 16 desafios institucionais com 73 testes abrangentes.',
    'projects.canvasKit.description':
      'Biblioteca PHP open source de nível empresarial para integração com a API do Canvas LMS com 85% de cobertura. Arquitetada com padrões Active Record + DTO e conformidade PSR-12. Alcançou mais de 95% de cobertura com 964 testes e 4.430 asserções.',
    'projects.canvasCli.description':
      'Poderosa interface de linha de comando para Canvas LMS construída com Go. Inclui autenticação OAuth 2.0 com PKCE, integração com keyring do sistema, suporte multi-instância, limitação de taxa adaptativa e mais de 280 comandos. Modo REPL interativo com histórico e autocompletar.',
    'projects.alegraCli.description':
      'Interface de linha de comando para a API de contabilidade da Alegra, construída com Go e a mesma arquitetura do Canvas CLI. Cobre quase toda a API (contatos, produtos, faturas, pagamentos, despesas, relatórios e faturamento eletrônico DIAN/SAT) com credenciais no keyring do sistema operacional e um flag --dry-run em qualquer comando. Ações destrutivas podem ser restringidas com hooks para que um agente de IA não consiga executá-las, e inclui uma skill do Claude Code para que os agentes a usem corretamente desde a primeira tentativa.',
    'projects.n8nctl.description':
      'CLI em Go de binário único e muito rápida para a API de automação de fluxos do n8n, que gerencia fluxos, execuções e credenciais em várias instâncias por meio de perfis nomeados com chaves de API guardadas no keyring do sistema operacional. Trata os fluxos como código com GitOps (apply, lint, diff e convert), faz snapshots e promove fluxos entre instâncias (backup, restore, sync), e permite que agentes de IA operem o n8n com segurança por meio de um servidor MCP, um guard de agentes e um proxy que exige lint. Distribuída via Homebrew e Scoop com releases assinados com cosign.',
    'projects.cliwright.description':
      'Fábrica de CLIs com spec e gate: aponte-a para qualquer API REST e ela forja uma ferramenta de linha de comando completa e de nível de produção em Go + Cobra — autenticação no keyring do sistema, perfis nomeados, cliente resiliente com limitação de taxa adaptativa, servidor MCP, guard de agentes, CI/CD e releases assinados com cosign, empacotados para Homebrew e Scoop. Usa o loop /goal nativo do Claude Code ou Codex e conduz a construção até um gate de aceitação determinístico (make verify), então pronto significa comprovadamente pronto, não apenas afirmado. Com ela foram construídos tgctl e lsqueezy, e endurecidos n8nctl e alegra-cli.',
    'projects.tgctl.description':
      'Ferramenta de linha de comando no estilo gh para a Bot API do Telegram, construída com Go: envia mensagens e mídia, gerencia chats, membros, webhooks e o menu de comandos do bot, e consulta updates com saída em tabela/JSON/YAML/CSV. Suporta perfis nomeados para vários bots com tokens guardados no keyring do sistema operacional, e inclui um servidor MCP e um guard de agentes para que agentes de IA operem o Telegram com segurança. Distribuída via Homebrew e Scoop com releases assinados.',
    'projects.tgctlClaudeChannel.description':
      'Canal do Claude Code que conecta um bot do Telegram a uma sessão ao vivo do Claude Code: comande um agente persistente do seu celular com texto, enquetes, botões, mídia, reações e aprovações de permissões de ferramentas. Implementado como um pequeno servidor MCP stdio que filtra remetentes por pareamento ou lista de permitidos e executa cada operação do Telegram através da CLI tgctl, então não reimplementa lógica da Bot API e nunca guarda o token.',
    'projects.lsqueezy.description':
      'Interface de linha de comando de nível de produção para a API de e-commerce da Lemon Squeezy: lojas, produtos, pedidos, assinaturas, clientes, descontos, chaves de licença, checkouts e webhooks, automatizável com saída em tabela/json/yaml/csv e um filtro --jq. Esconde o envelope JSON:API atrás de registros planos prontos para tabelas, guarda as chaves no keyring do sistema, repete apenas requisições idempotentes e inclui um servidor MCP para agentes de IA. Construída com o playbook do cliwright.',
    'projects.adguardCli.description':
      'A interface de linha de comando que faltava para o AdGuard Home: cobre mais de 90% das suas 81 operações de API — clientes, serviços bloqueados, reescritas DNS, logs de consultas, filtros, DHCP e TLS, tudo com saída estruturada. Construída em Go para operadores de homelab e qualquer pessoa que automatize sua infraestrutura DNS, com um assistente de configuração e um comando doctor para diagnósticos de conectividade.',
    'projects.canvasKitLaravel.description':
      'Pacote de integração Laravel mínimo para Canvas LMS Kit com configuração zero. Suporte multi-tenant para alternar entre instâncias Canvas, utilitários de teste para simular chamadas de API e integração nativa com config, logging e testing do Laravel.',
    'projects.financeFlow.description':
      'Aplicação abrangente de gestão de finanças pessoais projetada para contratados na Colômbia. Inclui rastreamento multi-moeda, otimização de dívidas de cartão de crédito, cálculos de impostos e planejamento de metas financeiras com frontend React e backend FastAPI.',
    'projects.cvOptimizer.description':
      'Sistema impulsionado por IA usando Claude Code para personalizar CVs inteligentemente para candidaturas de emprego. Maximiza compatibilidade com ATS mantendo autenticidade ao reorganizar e enfatizar experiência existente sem fabricar informações.',
    'projects.todoWizard.description':
      'Aplicação moderna de gerenciamento de tarefas full-stack com React 18, TypeScript, FastAPI e PostgreSQL. Inclui organização por projetos, prioridades, tags, suporte markdown, ordenação drag-and-drop, atualizações em tempo real e modo escuro.',
    'projects.jwDiscordBot.description':
      'Bot do Discord que fornece textos diários, notícias e busca de tópicos do JW.org. Suporta múltiplos servidores com configuração de idioma por servidor (espanhol, inglês, português), posts programados e configurações com MongoDB.',
    'projects.dailyTextConverter.description':
      'Conversor de EPUB para JSON para publicações de texto diário com interface web, API REST e ferramenta CLI. Inclui atualizações de progresso em tempo real via Server-Sent Events, detecção automática de ano e estratégia de parsing dual com opção de armazenamento MongoDB.',
    'projects.paymentGateway.description':
      'Microserviço que permite aos usuários receber pagamentos por provedores configuráveis incluindo PayPal, RappiPay, Nequi, PayU, Tpaga, SrPago, VisaNet e MercadoPago.',
    'projects.ecommerceGateway.description':
      'Microserviço que sincroniza plataformas de e-commerce com o sistema contábil. Integrado com os marketplaces Shopify e Mercado Livre.',
    'projects.courseBuilder.description':
      'Ferramenta robusta para o Canvas LMS da ACUE que melhora a eficiência na criação de cursos. Introduz fluxo centralizado, melhor rastreamento de erros e elimina tarefas redundantes.',
    'projects.acueChatbots.description':
      'Plataforma de chatbots com IA para ACUE usando busca RAG híbrida com similaridade vetorial e correspondência de palavras-chave BM25. Inclui ingestão automatizada de base de conhecimento, motor de fluxos de trabalho visual com n8n, proteções de segurança e suporte multi-bot com Google Vertex AI.',
    'projects.acueCli.description':
      'Interface de linha de comando unificada para gerenciar a infraestrutura da ACUE em sistemas Cloud Run e baseados em VM. Inclui gerenciamento multi-ambiente, credenciais criptografadas com AES-256-GCM, registro de auditoria e auto-detecção com modo dry-run e rollback automático.',
    'projects.serverlessEvents.description':
      'Solução inovadora para lidar com eventos ao vivo no Canvas LMS usando funções serverless da GCP. Inclui decodificação JWT, armazenamento MySQL e tópicos Pub/Sub para processamento escalável.',
    'projects.infraLab.description':
      'Homelab completo abrangendo Raspberry Pi, VPS e estação de trabalho de desenvolvimento com mais de 20 serviços em contêineres. Inclui proxy reverso Nginx com 22 hosts com SSL.',
    'projects.portfolio.description':
      'Site de portfólio moderno construído com Astro com internacionalização (EN/ES/PT), View Transitions para navegação estilo SPA, animações AOS e SEO completo com Open Graph e dados estruturados JSON-LD. Implantado na Netlify com CI/CD.',
    'projects.riveraRefrigeracion.description':
      'Site profissional para Rivera Refrigeración, um negócio familiar de reparos de eletrodomésticos em Cali, Colômbia, com mais de 30 anos de experiência. Construído com Astro e Tailwind CSS, com sistema de blog, otimização de SEO e integração com WhatsApp. Implantado na Netlify.',
    'projects.roperoDeSuenos.description':
      'Site de e-commerce para Ropero de Sueños, apresentando closets artesanais de MDF para bonecas de moda. Inclui galeria de produtos, depoimentos, seção de FAQ, sistema de blog e integração com WhatsApp para pedidos. Construído com Astro, Tailwind CSS e Alpine.js.',
    'projects.invitas.description':
      'SaaS self-serve de convites digitais para o mercado hispano-falante da América Latina. Astro 5 SSR + ilhas React 19 (Three.js, motion). Stack de IA sobre Vertex (Gemini + Imagen 4 Fast) e DeepInfra — Asistente in-builder com ferramentas de patch / undo / edição de imagem, wizard guiado de criação, prompt de inspiração e importador de convidados (colar texto → parse para linhas); circuit breaker, limites de custo, filtro PII e rate limits por tier. Payment router data-driven com matriz de capacidades: Wompi para COP (cartão / PSE / Nequi / Bre-B QR) mais Lemon Squeezy internacional, modelo híbrido assinatura × por evento com cron de reconciliação e webhook past_due. Sistema de feature flags (ai / payment / kill-switch / experimento) com admin toggle e audit log. Domínios próprios via DNS verifier + TLS automático com Traefik. PostgreSQL + Drizzle (migrações forward-only, triggers de auditoria), Better-Auth, armazenamento em R2, share previews com @vercel/og, observabilidade com Sentry + Pino. Permissões em 4 camadas (auth → role → resource → action) com capability dictionary e um DB factory scoped que injeta o filtro de host no nível da query. Vitest (unit) + Playwright (e2e contra um serviço Postgres 17); o pre-commit roda lint-staged (ESLint + Prettier), typecheck e unit tests. CI em etapas: typecheck + build + guard de monotonicidade do journal do Drizzle → e2e → deploy disparado por SSH em main verde. Self-hosted no Coolify.',

    // Education
    'education.title': 'Educação',
    'education.subtitle': 'Formação acadêmica',
    'education.degree':
      'Tecnologia em Análise e Desenvolvimento de Sistemas de Informação',
    'education.date': 'Julho 2018',

    // Contact
    'contact.title': 'Entre em Contato',
    'contact.subtitle': 'Vamos trabalhar juntos',
    'contact.heading': 'Pronto para colaborar?',
    'contact.description':
      'Estou sempre aberto a discutir novos projetos, ideias criativas ou oportunidades para contribuir com a sua visão.',
    'contact.cta': 'Enviar E-mail',

    // Footer
    'footer.languages': 'Idiomas:',
    'footer.spanish': 'Espanhol (Nativo)',
    'footer.english': 'Inglês (Avançado)',
    'footer.copyright': 'Todos os direitos reservados.',

    // Schema
    'schema.jobTitle': 'Desenvolvedor Full Stack',
    'schema.description':
      'Desenvolvedor Full Stack experiente com mais de 7 anos especializado em aplicações web escaláveis, arquitetura de microserviços e infraestrutura em nuvem.',

    // Blog
    'blog.title': 'Blog',
    'blog.description':
      'Artigos sobre desenvolvimento web, engenharia de software e tecnologia.',
    'blog.readingTime': 'min de leitura',
    'blog.readMore': 'Leia mais',
    'blog.readAriaLabel': 'Leia',
    'blog.relatedPosts': 'Artigos Relacionados',
    'blog.relatedPostsSubtitle': 'Você também pode gostar',
    'blog.sharePost': 'Compartilhar este artigo',
    'blog.shareTwitter': 'Compartilhar no Twitter',
    'blog.shareFacebook': 'Compartilhar no Facebook',
    'blog.shareLinkedIn': 'Compartilhar no LinkedIn',
    'blog.shareReddit': 'Compartilhar no Reddit',
    'blog.shareEmail': 'Compartilhar por E-mail',
    'blog.toc': 'Sumário',
    'blog.tocSubtitle': 'Nesta página',
    'blog.authorBio': 'Sobre o Autor',
    'blog.publishedOn': 'Publicado em',
    'blog.updatedOn': 'Atualizado em',
    'blog.tags': 'Tags',
    'blog.taggedWith': 'Marcado com',
    'blog.backToAllPosts': 'Voltar para todos os artigos',
    'blog.pagination.previous': 'Anterior',
    'blog.pagination.next': 'Próximo',
    'blog.pagination.pageOf': 'Página {current} de {total}',
    'blog.pagination.aria': 'Paginação do blog',
    'blog.breadcrumb.home': 'Início',
    'blog.breadcrumb.blog': 'Blog',
    'blog.article': 'artigo',
    'blog.articles': 'artigos',

    // 404
    '404.title': 'Página Não Encontrada',
    '404.description': 'A página que você procura não existe ou foi movida.',
    '404.cta': 'Voltar ao Início',

    // Newsletter
    'newsletter.heading': 'Receba os novos posts no seu inbox',
    'newsletter.intro':
      'Notas práticas sobre desenvolvimento assistido por IA, ferramentas e os sistemas por trás. Um email quando sai um post novo, sem spam.',
    'newsletter.emailLabel': 'E-mail',
    'newsletter.emailPlaceholder': 'voce@email.com',
    'newsletter.submit': 'Inscrever-se',
    'newsletter.hint':
      'Você vai receber um email para confirmar o endereço. Pode cancelar a inscrição quando quiser.',
    'newsletter.success':
      'Quase lá. Verifique seu inbox para o email de confirmação.',
    'newsletter.alreadyMsg': 'Você já está na lista.',
    'newsletter.error': 'Não foi possível se inscrever. Tente em instantes.',
  },
} as const satisfies Record<Lang, Record<string, string>>;

// Experience highlights (arrays)
export const experienceHighlights = {
  en: {
    acue: [
      'Full-stack development across PHP, Go, Python/Django, and JavaScript for EdTech platform',
      'Built internal CLIs, AI chatbots (Vertex AI + FastAPI), and monitoring infrastructure',
      'GCP: Cloud Run, Cloud Functions, Cloud SQL, BigQuery, Secret Manager',
      'CI/CD pipelines, automated testing, and developer tooling across 8+ repositories',
    ],
    hellobuild: [
      'Development of microservices using Node.js and Serverless',
      'Development, refactoring and management of PHP applications',
      'Management of docker environments',
      'Cloud: Amazon Web Services (AWS)',
    ],
    alegra: [
      'Development of Laravel microservices',
      'Vue.js micro-frontends implementation',
      'AWS (ECS, CodeBuild, SNS, SQS)',
      'E-commerce integrations (Shopify, Mercado Libre)',
      'Online payments integrations (Nequi, RappiPay, MercadoPago, etc.)',
    ],
    usc: [
      'Development of Laravel applications',
      'Administration of Linux servers',
      'GitLab DevOps: CI/CD, Monitoring, Container Registry',
      'Management of docker environments',
      'Oracle Database administration',
    ],
  },
  es: {
    acue: [
      'Desarrollo full-stack en PHP, Go, Python/Django y JavaScript para una plataforma EdTech',
      'Construcción de CLIs internas, chatbots de IA (Vertex AI + FastAPI) e infraestructura de monitoreo',
      'GCP: Cloud Run, Cloud Functions, Cloud SQL, BigQuery, Secret Manager',
      'Pipelines de CI/CD, pruebas automatizadas y herramientas para desarrolladores en más de 8 repositorios',
    ],
    hellobuild: [
      'Desarrollo de microservicios usando Node.js y Serverless',
      'Desarrollo, refactorización y gestión de aplicaciones PHP',
      'Gestión de ambientes Docker',
      'Nube: Amazon Web Services (AWS)',
    ],
    alegra: [
      'Desarrollo de microservicios en Laravel',
      'Implementación de micro-frontends con Vue.js',
      'AWS (ECS, CodeBuild, SNS, SQS)',
      'Integraciones de comercio electrónico (Shopify, Mercado Libre)',
      'Integraciones de pagos en línea (Nequi, RappiPay, MercadoPago, etc.)',
    ],
    usc: [
      'Desarrollo de aplicaciones Laravel',
      'Administración de servidores Linux',
      'GitLab DevOps: CI/CD, Monitoreo, Container Registry',
      'Gestión de ambientes Docker',
      'Administración de bases de datos Oracle',
    ],
  },
  pt: {
    acue: [
      'Desenvolvimento full-stack em PHP, Go, Python/Django e JavaScript para uma plataforma EdTech',
      'Construção de CLIs internas, chatbots de IA (Vertex AI + FastAPI) e infraestrutura de monitoramento',
      'GCP: Cloud Run, Cloud Functions, Cloud SQL, BigQuery, Secret Manager',
      'Pipelines de CI/CD, testes automatizados e ferramentas para desenvolvedores em mais de 8 repositórios',
    ],
    hellobuild: [
      'Desenvolvimento de microserviços com Node.js e Serverless',
      'Desenvolvimento, refatoração e gerenciamento de aplicações PHP',
      'Gestão de ambientes Docker',
      'Nuvem: Amazon Web Services (AWS)',
    ],
    alegra: [
      'Desenvolvimento de microserviços em Laravel',
      'Implementação de micro-frontends com Vue.js',
      'AWS (ECS, CodeBuild, SNS, SQS)',
      'Integrações de e-commerce (Shopify, Mercado Libre)',
      'Integrações de pagamentos online (Nequi, RappiPay, MercadoPago etc.)',
    ],
    usc: [
      'Desenvolvimento de aplicações Laravel',
      'Administração de servidores Linux',
      'GitLab DevOps: CI/CD, Monitoramento, Container Registry',
      'Gestão de ambientes Docker',
      'Administração de banco de dados Oracle',
    ],
  },
} as const;
