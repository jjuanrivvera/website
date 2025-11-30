/**
 * Enhanced reading time calculation
 * Accounts for code blocks and images in addition to text
 */

import readingTime from 'reading-time';
import type { ReadingTime } from '@models/blog';

interface ReadingTimeOptions {
  wordsPerMinute?: number;
  imageReadingTime?: number; // seconds per image
  codeBlockReadingTime?: number; // additional seconds per code block
}

const DEFAULT_OPTIONS: Required<ReadingTimeOptions> = {
  wordsPerMinute: 200,
  imageReadingTime: 12, // 12 seconds to view an image
  codeBlockReadingTime: 30, // 30 seconds to read a code block
};

/**
 * Calculate enhanced reading time for blog post content
 * @param content - The markdown/MDX content to analyze
 * @param options - Custom reading time options
 * @returns Enhanced reading time object
 */
export function getReadingTime(
  content: string,
  options: ReadingTimeOptions = {}
): ReadingTime {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Count images (both markdown and HTML)
  const imageMatches = content.match(/!\[.*?\]\(.*?\)|<img[^>]*>/g) || [];
  const imageCount = imageMatches.length;

  // Count code blocks (both fenced and indented)
  // Note: This regex handles most common cases but may not capture
  // all edge cases (nested/escaped backticks). For production use with
  // complex code examples, consider using the MDX AST parser instead.
  const codeBlockMatches =
    content.match(/```[\s\S]*?```|~~~[\s\S]*?~~~/g) || [];
  const codeBlockCount = codeBlockMatches.length;

  // Calculate base reading time (text only)
  const baseReading = readingTime(content, {
    wordsPerMinute: opts.wordsPerMinute,
  });

  // Add time for images
  const imageTime = imageCount * opts.imageReadingTime;

  // Add time for code blocks
  const codeTime = codeBlockCount * opts.codeBlockReadingTime;

  // Total reading time in seconds
  const totalTime = Math.ceil(baseReading.time / 1000) + imageTime + codeTime;

  // Convert to minutes
  const totalMinutes = Math.ceil(totalTime / 60);

  // Generate human-readable text based on language
  const text = `${totalMinutes} min read`;

  return {
    text,
    minutes: totalMinutes,
    time: totalTime * 1000, // Convert back to milliseconds
    words: baseReading.words,
  };
}

/**
 * Get localized reading time text
 * @param minutes - Reading time in minutes
 * @param lang - Language code
 * @returns Localized reading time string
 */
export function getLocalizedReadingTime(
  minutes: number,
  lang: 'en' | 'es' | 'pt'
): string {
  const texts = {
    en: `${minutes} min read`,
    es: `${minutes} min de lectura`,
    pt: `${minutes} min de leitura`,
  };

  return texts[lang];
}
