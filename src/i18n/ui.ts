export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export const defaultLang = 'en' as const;

export type Lang = keyof typeof languages;
export type TranslationKey = keyof (typeof ui)['en'];

export const ui = {
  en: {
    // Meta
    'meta.title': 'Juan Felipe Rivera Gonzalez | Full Stack Developer',
    'meta.description': 'Juan Felipe Rivera Gonzalez - Full Stack Developer with 7+ years of experience in scalable web applications, microservices, and cloud infrastructure.',
    'meta.keywords': 'Full Stack Developer, PHP, Laravel, Vue.js, AWS, GCP, Node.js, Software Engineer',
    'meta.og.title': 'Juan Felipe Rivera Gonzalez - Full Stack Developer',
    'meta.og.description': 'Seasoned Full Stack Developer with 7+ years specializing in scalable web applications and cloud infrastructure.',
    'meta.og.imageAlt': 'Juan Felipe Rivera Gonzalez - Full Stack Developer',
    'meta.og.siteName': 'Juan Felipe Rivera Portfolio',

    // Accessibility
    'a11y.skipLink': 'Skip to main content',
    'a11y.toggleMenu': 'Toggle menu',
    'a11y.mobileMenu': 'Mobile navigation',
    'a11y.linkedin': 'LinkedIn profile',
    'a11y.email': 'Send email',
    'a11y.github': 'GitHub profile',
    'a11y.langSwitch': 'Switch to Spanish',

    // Navigation
    'nav.experience': 'Experience',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.education': 'Education',
    'nav.contact': 'Contact',

    // Hero
    'hero.name': 'Juan Felipe Rivera Gonzalez',
    'hero.title': 'Full Stack Developer',
    'hero.description': 'Seasoned Full Stack Developer with 7+ years of experience specializing in scalable web applications, microservices architecture, and cloud infrastructure. Proven track record delivering enterprise-grade solutions for international clients in fintech and education industries.',
    'hero.imageAlt': 'Juan Felipe Rivera Gonzalez - Full Stack Developer specializing in PHP, Laravel, Vue.js, AWS, and GCP',
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
    'projects.acuePortal.description': 'Enterprise Django application managing 580+ institutional partnerships with faculty enrollment tracking, certificate generation, and cohort management. Built integrations with Salesforce CRM, Canvas LMS, SendGrid, and BigQuery.',
    'projects.canvasKit.description': 'Enterprise-grade open-source PHP library for Canvas LMS API integration with 85% API coverage. Architected using Active Record + DTO patterns with PSR-12 compliance. Achieved 95%+ test coverage with 964 tests and 4,430 assertions.',
    'projects.paymentGateway.description': 'Microservice enabling users to receive payments through configurable providers including PayPal, RappiPay, Nequi, PayU, Tpaga, SrPago, VisaNet, and MercadoPago.',
    'projects.ecommerceGateway.description': 'Microservice allowing users to sync their E-commerce platforms with the accounting system. Integrated with Shopify and Mercado Libre marketplaces.',
    'projects.courseBuilder.description': 'Robust tool for ACUE\'s Canvas LMS improving course creation efficiency. Introduced centralized workflow, improved error tracking, and eliminated redundant tasks.',
    'projects.serverlessEvents.description': 'Innovative solution for handling live events in Canvas LMS using GCP serverless functions. Features JWT decoding, MySQL storage, and Pub/Sub topics for scalable processing.',
    'projects.infraLab.description': 'Comprehensive homelab spanning Raspberry Pi, VPS, and development workstation with 20+ containerized services. Includes Nginx reverse proxy with 22 SSL-enabled hosts.',
    'projects.portfolio.description': 'Modern portfolio website built with Astro featuring internationalization (EN/ES), View Transitions for SPA-like navigation, AOS animations, and comprehensive SEO with Open Graph and JSON-LD structured data. Deployed on Netlify with CI/CD.',

    // Education
    'education.title': 'Education',
    'education.subtitle': 'Academic background',
    'education.degree': 'Technology in Information System Analysis and Development',
    'education.date': 'July 2018',

    // Contact
    'contact.title': 'Get In Touch',
    'contact.subtitle': 'Let\'s work together',
    'contact.heading': 'Ready to collaborate?',
    'contact.description': 'I\'m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.',
    'contact.cta': 'Send Email',

    // Footer
    'footer.languages': 'Languages:',
    'footer.spanish': 'Spanish (Native)',
    'footer.english': 'English (Advanced)',
    'footer.copyright': 'All rights reserved.',

    // Schema
    'schema.jobTitle': 'Full Stack Developer',
    'schema.description': 'Seasoned Full Stack Developer with 7+ years of experience specializing in scalable web applications, microservices architecture, and cloud infrastructure.',

    // 404
    '404.title': 'Page Not Found',
    '404.description': 'The page you\'re looking for doesn\'t exist or has been moved.',
    '404.cta': 'Go Home',
  },

  es: {
    // Meta
    'meta.title': 'Juan Felipe Rivera Gonzalez | Desarrollador Full Stack',
    'meta.description': 'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack con más de 7 años de experiencia en aplicaciones web escalables, microservicios e infraestructura en la nube.',
    'meta.keywords': 'Desarrollador Full Stack, PHP, Laravel, Vue.js, AWS, GCP, Node.js, Ingeniero de Software',
    'meta.og.title': 'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack',
    'meta.og.description': 'Desarrollador Full Stack experimentado con más de 7 años especializándose en aplicaciones web escalables e infraestructura en la nube.',
    'meta.og.imageAlt': 'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack',
    'meta.og.siteName': 'Portafolio de Juan Felipe Rivera',

    // Accessibility
    'a11y.skipLink': 'Saltar al contenido principal',
    'a11y.toggleMenu': 'Alternar menú',
    'a11y.mobileMenu': 'Navegación móvil',
    'a11y.linkedin': 'Perfil de LinkedIn',
    'a11y.email': 'Enviar correo electrónico',
    'a11y.github': 'Perfil de GitHub',
    'a11y.langSwitch': 'Cambiar a inglés',

    // Navigation
    'nav.experience': 'Experiencia',
    'nav.skills': 'Habilidades',
    'nav.projects': 'Proyectos',
    'nav.education': 'Educación',
    'nav.contact': 'Contacto',

    // Hero
    'hero.name': 'Juan Felipe Rivera Gonzalez',
    'hero.title': 'Desarrollador Full Stack',
    'hero.description': 'Desarrollador Full Stack experimentado con más de 7 años de experiencia especializándose en aplicaciones web escalables, arquitectura de microservicios e infraestructura en la nube. Historial comprobado entregando soluciones empresariales para clientes internacionales en las industrias fintech y educación.',
    'hero.imageAlt': 'Juan Felipe Rivera Gonzalez - Desarrollador Full Stack especializado en PHP, Laravel, Vue.js, AWS y GCP',
    'hero.cta.contact': 'Contáctame',
    'hero.cta.experience': 'Ver Experiencia',
    'hero.cta.download': 'Descargar CV',

    // Experience
    'experience.title': 'Experiencia Profesional',
    'experience.subtitle': 'Más de 7 años construyendo soluciones empresariales',
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
    'projects.subtitle': 'Soluciones empresariales y contribuciones de código abierto',
    'projects.acuePortal.description': 'Aplicación empresarial Django que gestiona más de 580 asociaciones institucionales con seguimiento de inscripción de docentes, generación de certificados y gestión de cohortes. Construí integraciones con Salesforce CRM, Canvas LMS, SendGrid y BigQuery.',
    'projects.canvasKit.description': 'Biblioteca PHP de código abierto de nivel empresarial para integración con la API de Canvas LMS con 85% de cobertura de API. Arquitectura usando patrones Active Record + DTO con cumplimiento PSR-12. Logré más del 95% de cobertura de pruebas con 964 tests y 4,430 aserciones.',
    'projects.paymentGateway.description': 'Microservicio que permite a los usuarios recibir pagos a través de proveedores configurables incluyendo PayPal, RappiPay, Nequi, PayU, Tpaga, SrPago, VisaNet y MercadoPago.',
    'projects.ecommerceGateway.description': 'Microservicio que permite a los usuarios sincronizar sus plataformas de comercio electrónico con el sistema contable. Integrado con Shopify y Mercado Libre.',
    'projects.courseBuilder.description': 'Herramienta robusta para el Canvas LMS de ACUE que mejora la eficiencia en la creación de cursos. Introduje flujo de trabajo centralizado, seguimiento de errores mejorado y eliminación de tareas redundantes.',
    'projects.serverlessEvents.description': 'Solución innovadora para manejar eventos en vivo en Canvas LMS usando funciones serverless de GCP. Incluye decodificación JWT, almacenamiento MySQL y topics Pub/Sub para procesamiento escalable.',
    'projects.infraLab.description': 'Laboratorio completo que abarca Raspberry Pi, VPS y estación de trabajo de desarrollo con más de 20 servicios en contenedores. Incluye proxy reverso Nginx con 22 hosts habilitados para SSL.',
    'projects.portfolio.description': 'Sitio web de portafolio moderno construido con Astro con internacionalización (EN/ES), View Transitions para navegación tipo SPA, animaciones AOS y SEO completo con Open Graph y datos estructurados JSON-LD. Desplegado en Netlify con CI/CD.',

    // Education
    'education.title': 'Educación',
    'education.subtitle': 'Formación académica',
    'education.degree': 'Tecnología en Análisis y Desarrollo de Sistemas de Información',
    'education.date': 'Julio 2018',

    // Contact
    'contact.title': 'Ponte en Contacto',
    'contact.subtitle': 'Trabajemos juntos',
    'contact.heading': '¿Listo para colaborar?',
    'contact.description': 'Siempre estoy abierto a discutir nuevos proyectos, ideas creativas u oportunidades para ser parte de tu visión.',
    'contact.cta': 'Enviar Email',

    // Footer
    'footer.languages': 'Idiomas:',
    'footer.spanish': 'Español (Nativo)',
    'footer.english': 'Inglés (Avanzado)',
    'footer.copyright': 'Todos los derechos reservados.',

    // Schema
    'schema.jobTitle': 'Desarrollador Full Stack',
    'schema.description': 'Desarrollador Full Stack experimentado con más de 7 años de experiencia especializándose en aplicaciones web escalables, arquitectura de microservicios e infraestructura en la nube.',

    // 404
    '404.title': 'Página No Encontrada',
    '404.description': 'La página que buscas no existe o ha sido movida.',
    '404.cta': 'Ir al Inicio',
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
} as const;
