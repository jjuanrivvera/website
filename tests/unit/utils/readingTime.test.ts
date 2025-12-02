import { describe, it, expect } from 'vitest';
import { getReadingTime, getLocalizedReadingTime } from '@utils/readingTime';

describe('getReadingTime', () => {
  it('calculates reading time for short text', () => {
    const text = 'Hello world '.repeat(50); // ~100 words
    const result = getReadingTime(text);

    expect(result.minutes).toBe(1); // 200 WPM = ~1 min
    expect(result.text).toBe('1 min read');
    expect(result.words).toBe(100);
  });

  it('calculates reading time for longer text', () => {
    const text = 'Hello world '.repeat(200); // ~400 words
    const result = getReadingTime(text);

    expect(result.minutes).toBe(2); // 200 WPM = ~2 min
    expect(result.words).toBe(400);
  });

  it('accounts for images in reading time', () => {
    const textWith3Images = `
      Hello world. ![alt text](image1.jpg)
      Some more text. ![](image2.png)
      Even more text. <img src="image3.jpg" alt="test">
    `;
    const result = getReadingTime(textWith3Images);

    // 3 images * 12 seconds = 36 seconds = 1 minute added
    // Plus the text reading time
    expect(result.minutes).toBeGreaterThanOrEqual(1);
  });

  it('accounts for code blocks in reading time', () => {
    const textWithCode = `
      Here's some code:
      \`\`\`javascript
      function hello() {
        console.log('world');
      }
      \`\`\`
      And more code:
      ~~~python
      def hello():
        print('world')
      ~~~
    `;
    const result = getReadingTime(textWithCode);

    // 2 code blocks * 30 seconds = 60 seconds = 1 minute added
    expect(result.minutes).toBeGreaterThanOrEqual(1);
  });

  it('rounds up reading time to nearest minute', () => {
    const text = 'Hello world '.repeat(150); // ~300 words
    const result = getReadingTime(text);

    // 300 words / 200 WPM = 1.5 min, should round to 2
    expect(result.minutes).toBe(2);
  });

  it('returns minimum 1 minute for very short text', () => {
    const text = 'Hello world';
    const result = getReadingTime(text);

    expect(result.minutes).toBe(1);
  });

  it('accepts custom words per minute', () => {
    const text = 'Hello world '.repeat(100); // ~200 words
    const result = getReadingTime(text, { wordsPerMinute: 100 });

    // 200 words / 100 WPM = 2 min
    expect(result.minutes).toBe(2);
  });
});

describe('getLocalizedReadingTime', () => {
  it('returns English reading time text', () => {
    expect(getLocalizedReadingTime(5, 'en')).toBe('5 min read');
  });

  it('returns Spanish reading time text', () => {
    expect(getLocalizedReadingTime(5, 'es')).toBe('5 min de lectura');
  });

  it('returns Portuguese reading time text', () => {
    expect(getLocalizedReadingTime(5, 'pt')).toBe('5 min de leitura');
  });

  it('handles singular minute correctly', () => {
    expect(getLocalizedReadingTime(1, 'en')).toBe('1 min read');
    expect(getLocalizedReadingTime(1, 'es')).toBe('1 min de lectura');
    expect(getLocalizedReadingTime(1, 'pt')).toBe('1 min de leitura');
  });
});
