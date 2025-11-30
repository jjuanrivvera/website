import type { SupportedLang } from '@models/blog';
import { LOCALE_MAP } from '@config/site';

/**
 * Format a date for display in the specified language
 */
export function formatDate(date: Date, lang: SupportedLang): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date for display with short month (Jan, Feb, etc.)
 */
export function formatDateShort(date: Date, lang: SupportedLang): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[lang], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date for ISO display (machine-readable)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Get relative time string (e.g., "2 days ago", "hace 3 días")
 */
export function formatRelativeTime(date: Date, lang: SupportedLang): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(LOCALE_MAP[lang], {
    numeric: 'auto',
  });

  if (diffDays === 0) return rtf.format(0, 'day');
  if (diffDays < 7) return rtf.format(-diffDays, 'day');
  if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), 'week');
  if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
  return rtf.format(-Math.floor(diffDays / 365), 'year');
}
