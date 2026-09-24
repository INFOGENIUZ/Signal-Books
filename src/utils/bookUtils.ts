import { Book } from '../types';

/**
 * Checks if a book was uploaded/added within the last 24 hours.
 * Returns false if createdAt is older than 24 hours or missing.
 */
export function isBookNew(book: Book): boolean {
  if (!book || !book.createdAt) return false;
  const createdTime = new Date(book.createdAt).getTime();
  if (isNaN(createdTime)) return false;
  const now = Date.now();
  const diffHours = (now - createdTime) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 24;
}

/**
 * Shuffles an array randomly (Fisher-Yates algorithm).
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
