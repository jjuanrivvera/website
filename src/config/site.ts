import type { SupportedLang } from '@models/blog';

export const SITE_CONFIG = {
  url: 'https://jjuanrivvera.com',
  title: 'Juan Felipe Rivera González',
  author: 'Juan Felipe Rivera González',
  email: 'jjuanrivvera@gmail.com',
  twitter: '@jjuanrivvera99',
  github: 'jjuanrivvera',
  linkedin: 'jjuanrivvera99',
  defaultLanguage: 'en' as const,
  supportedLanguages: ['en', 'es', 'pt'] as const,
} as const;

export const LOCALE_MAP: Record<SupportedLang, string> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
} as const;
