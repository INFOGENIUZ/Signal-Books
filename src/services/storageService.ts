import { Book, Category, Author, User, ReadingHistoryItem } from '../types';
import { INITIAL_BOOKS, INITIAL_CATEGORIES, INITIAL_AUTHORS, DEMO_USER } from '../data/mockData';

const STORAGE_KEYS = {
  BOOKS: 'signal_books_data_v3',
  CATEGORIES: 'signal_categories_data_v3',
  AUTHORS: 'signal_authors_data_v3',
  FAVORITES: 'signal_favorites_v3',
  HISTORY: 'signal_history_v3',
  USER: 'signal_user_v3',
  BOOKMARKS: 'signal_bookmarks_v3',
};

// Clean up any legacy mock data keys from earlier sessions
try {
  const legacyKeys = [
    'kitoblar_olami_books_v1',
    'kitoblar_olami_books_v2',
    'kitoblar_olami_categories_v1',
    'kitoblar_olami_categories_v2',
    'kitoblar_olami_authors_v1',
    'kitoblar_olami_favorites_v1',
    'kitoblar_olami_history_v1',
    'kitoblar_olami_user_v1',
    'kitoblar_olami_bookmarks_v1'
  ];
  legacyKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });
} catch {}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota exceeded or blocked in iframe
  }
}

export const StorageService = {
  getBooks(): Book[] {
    try {
      const data = safeGet(STORAGE_KEYS.BOOKS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    safeSet(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
    return INITIAL_BOOKS;
  },

  saveBooks(books: Book[]): void {
    safeSet(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  },

  deleteBook(bookId: string): Book[] {
    const current = this.getBooks();
    const filtered = current.filter(b => b.id !== bookId);
    this.saveBooks(filtered);

    // Remove from favorites
    const favs = this.getFavorites();
    if (favs.includes(bookId)) {
      this.toggleFavorite(bookId);
    }

    // Remove from history
    try {
      const history = this.getReadingHistory().filter(h => h.bookId !== bookId);
      safeSet(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {}

    // Remove progress keys
    try {
      localStorage.removeItem(`signal_book_progress_${bookId}`);
    } catch {}

    return filtered;
  },

  incrementBookViews(bookId: string): number {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === bookId);
    let newViews = 1;
    if (index !== -1) {
      newViews = (books[index].views || 0) + 1;
      books[index].views = newViews;
      this.saveBooks(books);
    }
    return newViews;
  },

  getCategories(): Category[] {
    try {
      const data = safeGet(STORAGE_KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    safeSet(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: Category[]): void {
    safeSet(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getAuthors(): Author[] {
    try {
      const data = safeGet(STORAGE_KEYS.AUTHORS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    safeSet(STORAGE_KEYS.AUTHORS, JSON.stringify(INITIAL_AUTHORS));
    return INITIAL_AUTHORS;
  },

  saveAuthors(authors: Author[]): void {
    safeSet(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
  },

  getFavorites(): string[] {
    try {
      const data = safeGet(STORAGE_KEYS.FAVORITES);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return [];
  },

  toggleFavorite(bookId: string): string[] {
    const favorites = this.getFavorites();
    let updated: string[];
    if (favorites.includes(bookId)) {
      updated = favorites.filter(id => id !== bookId);
    } else {
      updated = [...favorites, bookId];
    }
    safeSet(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  },

  getReadingHistory(): ReadingHistoryItem[] {
    try {
      const data = safeGet(STORAGE_KEYS.HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return [];
  },

  getBookProgress(bookId: string, userId?: string): number {
    try {
      if (!bookId) return 1;

      // 1. Check user-scoped progress first if available
      if (userId) {
        const userDirect = safeGet(`signal_user_progress_${userId}_${bookId}`);
        if (userDirect) {
          const parsed = parseInt(userDirect, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      }

      // 2. Check direct book progress
      const direct = safeGet(`signal_book_progress_${bookId}`);
      if (direct) {
        const parsed = parseInt(direct, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }

      // 3. Check history
      const history = this.getReadingHistory();
      const item = history.find(h => h.bookId === bookId);
      if (item && item.currentPage > 0) {
        return item.currentPage;
      }
    } catch {
      // fallback
    }
    return 1;
  },

  saveBookProgress(bookId: string, page: number, userId?: string): void {
    if (!bookId || page < 1) return;
    try {
      safeSet(`signal_book_progress_${bookId}`, String(page));
      if (userId) {
        safeSet(`signal_user_progress_${userId}_${bookId}`, String(page));
      }
    } catch {
      // ignore
    }
  },

  updateReadingProgress(book: Book, page: number, userId?: string): ReadingHistoryItem[] {
    const validPage = Math.max(1, page);
    this.saveBookProgress(book.id, validPage, userId);

    const history = this.getReadingHistory();
    const totalPages = book.pages || 1;
    const progressPercent = Math.min(100, Math.round((validPage / totalPages) * 100));
    
    const existingIndex = history.findIndex(item => item.bookId === book.id);
    const updatedItem: ReadingHistoryItem = {
      bookId: book.id,
      bookTitle: book.title,
      authorName: book.authorName,
      coverUrl: book.coverUrl,
      currentPage: validPage,
      totalPages: book.pages,
      progressPercent,
      lastReadAt: 'Hozirgina'
    };

    let updatedHistory: ReadingHistoryItem[];
    if (existingIndex >= 0) {
      updatedHistory = [
        updatedItem,
        ...history.filter((_, idx) => idx !== existingIndex)
      ];
    } else {
      updatedHistory = [updatedItem, ...history];
    }

    safeSet(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
    return updatedHistory;
  },

  getUser(): User | null {
    try {
      const data = safeGet(STORAGE_KEYS.USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    safeSet(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
    return DEMO_USER;
  },

  saveUser(user: User | null): void {
    try {
      if (user) {
        safeSet(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {
      // ignore
    }
  }
};
