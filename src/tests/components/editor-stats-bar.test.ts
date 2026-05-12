import { describe, it, expect } from 'vitest';

// Extract and test the pure helper in isolation
function wordsToReadingTime(words: number): string {
    const wpm = 200;
    const minutes = Math.ceil(words / wpm);
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
}

describe('wordsToReadingTime', () => {
    it('returns "< 1 min" for 0 words', () => {
        expect(wordsToReadingTime(0)).toBe('< 1 min');
    });

    it('returns "1 min" for 199 words (ceil(199/200) === 1)', () => {
        expect(wordsToReadingTime(199)).toBe('1 min');
    });

    it('returns "1 min" for exactly 200 words', () => {
        expect(wordsToReadingTime(200)).toBe('1 min');
    });

    it('rounds up partial minutes', () => {
        expect(wordsToReadingTime(201)).toBe('2 min');
    });

    it('handles large word counts', () => {
        expect(wordsToReadingTime(2000)).toBe('10 min');
    });
});
