/**
 * Projects Configuration
 * Central configuration for all project data displayed on the site
 */

export interface Project {
  /** Unique key used for i18n translation lookups */
  key: string;
  /** Display title of the project */
  title: string;
  /** Whether this is a featured/highlighted project */
  featured: boolean;
  /** Whether to show on homepage (defaults to true for backward compatibility) */
  showOnHomepage?: boolean;
  /** Technology tags to display */
  techTags: string[];
  /** GitHub repository URL (optional) */
  githubUrl?: string;
  /** Live demo URL (optional) */
  demoUrl?: string;
  /** Image path in src/assets/img/projects/ or public URL (optional) */
  image?: string;
  /** Alt text for the image */
  imageAlt?: string;
}

/**
 * All projects data
 * Order determines display order on both homepage section and projects page
 */
export const projects: Project[] = [
  {
    key: 'portfolio',
    title: 'Personal Portfolio',
    featured: true,
    techTags: ['Astro', 'TypeScript', 'i18n', 'Netlify'],
    githubUrl: 'https://github.com/jjuanrivvera/website',
    demoUrl: 'https://jjuanrivvera.com',
  },
  {
    key: 'nsseWizard',
    title: 'Student Voice Navigator',
    featured: true,
    techTags: ['Django', 'Python', 'MySQL', 'GCP', 'SendGrid'],
  },
  {
    key: 'canvasKit',
    title: 'Canvas LMS PHP SDK',
    featured: true,
    techTags: ['PHP', 'PHPUnit', 'Open Source', 'Packagist'],
    githubUrl: 'https://github.com/jjuanrivvera/canvas-lms-kit',
  },
  {
    key: 'canvasCli',
    title: 'Canvas CLI',
    featured: true,
    techTags: ['Go', 'Cobra', 'OAuth 2.0', 'Homebrew'],
    githubUrl: 'https://github.com/jjuanrivvera/canvas-cli',
    demoUrl: 'https://jjuanrivvera.github.io/canvas-cli/',
  },
  {
    key: 'canvasMcp',
    title: 'Canvas LMS MCP Server',
    featured: true,
    showOnHomepage: false,
    techTags: ['TypeScript', 'MCP', 'Zod', 'AI Tools'],
    githubUrl: 'https://github.com/jjuanrivvera/canvas-lms-mcp',
  },
  {
    key: 'canvasKitLaravel',
    title: 'Canvas LMS Kit for Laravel',
    featured: false,
    showOnHomepage: false,
    techTags: ['Laravel', 'PHP', 'Packagist'],
    githubUrl: 'https://github.com/jjuanrivvera/canvas-lms-kit-laravel',
  },
  {
    key: 'financeFlow',
    title: 'FinanceFlow',
    featured: true,
    showOnHomepage: false,
    techTags: ['React', 'FastAPI', 'PostgreSQL', 'TypeScript'],
    githubUrl: 'https://github.com/jjuanrivvera/finance-flow',
  },
  {
    key: 'cvOptimizer',
    title: 'CV Optimizer',
    featured: false,
    showOnHomepage: false,
    techTags: ['Node.js', 'Claude Code', 'AI', 'CLI'],
    githubUrl: 'https://github.com/jjuanrivvera/cv-optimizer',
  },
  {
    key: 'todoWizard',
    title: 'Todo Wizard',
    featured: false,
    showOnHomepage: false,
    techTags: ['React 18', 'FastAPI', 'PostgreSQL', 'TailwindCSS'],
    githubUrl: 'https://github.com/jjuanrivvera/todo-wizard',
  },
  {
    key: 'jwDiscordBot',
    title: 'JW Discord Bot',
    featured: false,
    showOnHomepage: false,
    techTags: ['Node.js', 'Discord.js', 'MongoDB', 'Multi-language'],
    githubUrl: 'https://github.com/jjuanrivvera/jw-discord-bot',
  },
  {
    key: 'dailyTextConverter',
    title: 'Daily Text EPUB to JSON',
    featured: false,
    showOnHomepage: false,
    techTags: ['Node.js', 'React', 'Express', 'CLI'],
    githubUrl: 'https://github.com/jjuanrivvera/daily-text-epub-to-json',
  },
  {
    key: 'paymentGateway',
    title: 'Payment Gateway',
    featured: false,
    techTags: ['Laravel', 'PHP', '8+ Providers'],
  },
  {
    key: 'ecommerceGateway',
    title: 'E-commerce Gateway',
    featured: false,
    techTags: ['Laravel', 'Vue.js', 'Shopify'],
  },
  {
    key: 'courseBuilder',
    title: 'Course Builder 2.0',
    featured: false,
    techTags: ['Canvas LMS', 'PHP', 'Automation'],
  },
  {
    key: 'acueChatbots',
    title: 'ACUE Chatbots & Integrations',
    featured: true,
    techTags: ['Python', 'FastAPI', 'n8n', 'GCP', 'Vertex AI'],
  },
  {
    key: 'acueCli',
    title: 'ACUE CLI',
    featured: false,
    showOnHomepage: false,
    techTags: ['Go', 'GCP', 'Cloud Run', 'CLI'],
  },
  {
    key: 'serverlessEvents',
    title: 'Serverless Event Management',
    featured: false,
    showOnHomepage: false,
    techTags: ['GCP Functions', 'Pub/Sub', 'Serverless'],
  },
  {
    key: 'infraLab',
    title: 'Multi-Environment Infrastructure Lab',
    featured: false,
    techTags: ['Docker', 'Homelab', 'Nginx', 'Tailscale'],
  },
  {
    key: 'riveraRefrigeracion',
    title: 'Rivera Refrigeración',
    featured: false,
    showOnHomepage: false,
    techTags: ['Astro', 'TypeScript', 'Tailwind CSS', 'Netlify'],
    demoUrl: 'https://rivera-refrigeracion.com',
  },
  {
    key: 'roperoDeSuenos',
    title: 'Ropero de Sueños',
    featured: false,
    showOnHomepage: false,
    techTags: ['Astro', 'Tailwind CSS', 'Alpine.js', 'TypeScript'],
    demoUrl: 'https://roperodesuenos.com',
  },
  {
    // Self-serve invitation SaaS for the LATAM market. Built solo
    // through the AI dev workflow Juan documents in his blog series
    // — every PR shipped via Claude Code with full test coverage,
    // CodeRabbit review, and a rolling decisions log. Featured on
    // the portfolio because it's the highest-leverage demo of the
    // documented approach: a real product with paying users (post-
    // launch) built end-to-end in this style.
    key: 'invitas',
    title: 'invitas.co — Digital Invitations for LATAM',
    featured: true,
    techTags: [
      'Astro 5',
      'React 18',
      'TypeScript',
      'PostgreSQL',
      'Drizzle ORM',
      'Tailwind CSS 4',
      'Better-Auth',
      'Cloudflare R2',
      'Vitest',
      'Playwright',
      'Coolify',
      'Traefik',
    ],
    demoUrl: 'https://invitas.co',
  },
];

/**
 * Get featured projects only
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

/**
 * Get projects for homepage (excludes projects with showOnHomepage: false)
 */
export function getHomepageProjects(): Project[] {
  return projects.filter((p) => p.showOnHomepage !== false);
}

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  return projects;
}
