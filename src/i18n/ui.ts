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
    'projects.canvasMcp.description':
      'TypeScript implementation of Model Context Protocol (MCP) server for Canvas LMS integration. Enables AI assistants to interact with educational platforms through 70+ type-safe workflow tools. Features Zod validation, neverthrow error handling, LRU caching, and intelligent rate limiting.',
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
    'projects.canvasMcp.description':
      'Implementación en TypeScript de servidor Model Context Protocol (MCP) para integración con Canvas LMS. Permite a asistentes de IA interactuar con plataformas educativas a través de más de 70 herramientas de flujo de trabajo con tipado seguro. Incluye validación Zod, manejo de errores con neverthrow y caché LRU.',
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
    'projects.canvasMcp.description':
      'Implementação em TypeScript de servidor Model Context Protocol (MCP) para integração com Canvas LMS. Permite que assistentes de IA interajam com plataformas educacionais através de mais de 70 ferramentas de fluxo de trabalho com tipagem segura. Inclui validação Zod, tratamento de erros com neverthrow e cache LRU.',
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
  },
} as const satisfies Record<Lang, Record<string, string>>;

// Experience highlights (arrays)
export const experienceHighlights = {
  en: {
    acue: [
      'Development, refactoring and management of PHP applications',
      'GCP (Cloud SQL, Functions, Cloud Run, BigQuery)',
      'Integration of Laravel and Symfony components',
      'Development of frontend interfaces using Vue.js and Bootstrap 5',
      'Development of Python serverless functions',
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
      'Desarrollo, refactorización y gestión de aplicaciones PHP',
      'GCP (Cloud SQL, Functions, Cloud Run, BigQuery)',
      'Integración de componentes Laravel y Symfony',
      'Desarrollo de interfaces frontend usando Vue.js y Bootstrap 5',
      'Desarrollo de funciones serverless en Python',
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
      'Desenvolvimento, refatoração e gerenciamento de aplicações PHP',
      'GCP (Cloud SQL, Functions, Cloud Run, BigQuery)',
      'Integração de componentes Laravel e Symfony',
      'Desenvolvimento de interfaces frontend com Vue.js e Bootstrap 5',
      'Desenvolvimento de funções serverless em Python',
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
