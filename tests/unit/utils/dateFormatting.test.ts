import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateShort,
  formatDateISO,
  formatRelativeTime,
} from '@utils/dateFormatting';

describe('formatDate', () => {
  const testDate = new Date('2025-01-15T12:00:00Z');

  it('formats date in English (en-US)', () => {
    const formatted = formatDate(testDate, 'en');
    expect(formatted).toBe('January 15, 2025');
  });

  it('formats date in Spanish (es-ES)', () => {
    const formatted = formatDate(testDate, 'es');
    expect(formatted).toBe('15 de enero de 2025');
  });

  it('formats date in Portuguese (pt-BR)', () => {
    const formatted = formatDate(testDate, 'pt');
    expect(formatted).toBe('15 de janeiro de 2025');
  });
});

describe('formatDateShort', () => {
  const testDate = new Date('2025-01-15T12:00:00Z');

  it('formats short date in English', () => {
    const formatted = formatDateShort(testDate, 'en');
    expect(formatted).toBe('Jan 15, 2025');
  });

  it('formats short date in Spanish', () => {
    const formatted = formatDateShort(testDate, 'es');
    // Spanish short month format
    expect(formatted).toContain('ene');
    expect(formatted).toContain('2025');
  });

  it('formats short date in Portuguese', () => {
    const formatted = formatDateShort(testDate, 'pt');
    // Portuguese short month format
    expect(formatted).toContain('jan');
    expect(formatted).toContain('2025');
  });
});

describe('formatDateISO', () => {
  it('formats date in ISO 8601 format', () => {
    const testDate = new Date('2025-01-15T10:30:00.000Z');
    const formatted = formatDateISO(testDate);
    expect(formatted).toBe('2025-01-15T10:30:00.000Z');
  });

  it('preserves timezone information', () => {
    const testDate = new Date('2025-06-15T14:30:00.000Z');
    const formatted = formatDateISO(testDate);
    expect(formatted).toContain('T');
    expect(formatted).toContain('Z');
  });
});

describe('formatRelativeTime', () => {
  it('formats today as relative time', () => {
    const now = new Date();
    const formatted = formatRelativeTime(now, 'en');
    expect(formatted).toContain('today');
  });

  it('formats yesterday in English', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = formatRelativeTime(yesterday, 'en');
    expect(formatted).toContain('yesterday');
  });

  it('formats days ago in English', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const formatted = formatRelativeTime(threeDaysAgo, 'en');
    expect(formatted).toContain('3 days ago');
  });

  it('formats weeks ago in English', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const formatted = formatRelativeTime(twoWeeksAgo, 'en');
    expect(formatted).toContain('2 weeks ago');
  });

  it('formats months ago in English', () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const formatted = formatRelativeTime(twoMonthsAgo, 'en');
    expect(formatted).toContain('2 months ago');
  });

  it('formats years ago in English', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const formatted = formatRelativeTime(twoYearsAgo, 'en');
    expect(formatted).toContain('2 years ago');
  });

  it('formats relative time in Spanish', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = formatRelativeTime(yesterday, 'es');
    expect(formatted).toContain('ayer');
  });

  it('formats relative time in Portuguese', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = formatRelativeTime(yesterday, 'pt');
    expect(formatted).toContain('ontem');
  });
});
