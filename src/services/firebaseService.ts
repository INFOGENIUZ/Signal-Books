import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  increment,
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Book, Category, Author } from '../types';
import { INITIAL_BOOKS, INITIAL_CATEGORIES, INITIAL_AUTHORS } from '../data/mockData';

// Helper to get locally tracked deleted IDs to prevent any race condition
function getDeletedBookIds(): Set<string> {
  try {
    const raw = localStorage.getItem('signal_deleted_book_ids');
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {}
  return new Set();
}

export function recordDeletedBookId(bookId: string): void {
  try {
    const set = getDeletedBookIds();
    set.add(bookId);
    localStorage.setItem('signal_deleted_book_ids', JSON.stringify(Array.from(set)));
  } catch {}
}

// Helper to strip undefined values so Firestore doesn't throw
function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        clean[key] = sanitizeForFirestore(val);
      } else if (Array.isArray(val)) {
        clean[key] = val.map(item => 
          item !== null && typeof item === 'object' ? sanitizeForFirestore(item) : item
        );
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

export interface UserProgressData {
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  updatedAt: string;
}

export const FirebaseService = {
  // Real-time listener for all books across all devices
  subscribeBooks(onUpdate: (books: Book[]) => void): Unsubscribe {
    const booksCol = collection(db, 'books');
    
    return onSnapshot(
      booksCol,
      async (snapshot) => {
        const deletedIds = getDeletedBookIds();

        // Seed initial mock books only if live cloud database is completely empty and no deletions have been performed
        if (snapshot.empty && !snapshot.metadata.fromCache) {
          if (deletedIds.size === 0) {
            try {
              for (const book of INITIAL_BOOKS) {
                await setDoc(doc(db, 'books', book.id), sanitizeForFirestore(book), { merge: true });
              }
              onUpdate(INITIAL_BOOKS);
            } catch (seedErr) {
              onUpdate(INITIAL_BOOKS);
            }
          } else {
            onUpdate([]);
          }
          return;
        }

        const list: Book[] = [];
        snapshot.forEach((docSnap) => {
          const b = docSnap.data() as Book;
          const bookId = b?.id || docSnap.id;
          if (bookId && !deletedIds.has(bookId)) {
            const fullBook: Book = { ...b, id: bookId };
            list.push(fullBook);
          }
        });

        // Sort books: newer first, then featured/views
        list.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return (b.views || 0) - (a.views || 0);
        });

        onUpdate(list);
      },
      (error) => {
        const isUnavailable = (error as any)?.code === 'unavailable' || String(error).includes('unavailable');
        if (isUnavailable) {
          console.warn('Firestore is running in offline mode. Reading from local cache.');
        } else {
          try {
            handleFirestoreError(error, OperationType.LIST, 'books');
          } catch (e) {
            console.warn('Firestore books sync warning:', e);
          }
        }
      }
    );
  },

  // Add or update a book in Firestore
  async saveBook(book: Book): Promise<void> {
    const path = `books/${book.id}`;
    try {
      // If was previously marked deleted, unmark
      try {
        const set = getDeletedBookIds();
        if (set.has(book.id)) {
          set.delete(book.id);
          localStorage.setItem('signal_deleted_book_ids', JSON.stringify(Array.from(set)));
        }
      } catch {}

      const cleanData = sanitizeForFirestore({ ...book, id: book.id });
      await setDoc(doc(db, 'books', book.id), cleanData, { merge: true });
    } catch (error) {
      console.error('Firebase saveBook error:', error);
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Delete book from Firestore permanently
  async deleteBook(bookId: string): Promise<void> {
    const path = `books/${bookId}`;
    try {
      recordDeletedBookId(bookId);
      await deleteDoc(doc(db, 'books', bookId));
    } catch (error) {
      console.error('Firebase deleteBook error:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Increment live book view/open count in Firestore
  async incrementBookViews(bookId: string): Promise<void> {
    if (!bookId) return;
    const path = `books/${bookId}`;
    try {
      const bookRef = doc(db, 'books', bookId);
      await updateDoc(bookRef, {
        views: increment(1),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      try {
        const snap = await getDoc(doc(db, 'books', bookId));
        const currentViews = snap.exists() ? ((snap.data()?.views as number) || 0) : 0;
        await setDoc(doc(db, 'books', bookId), { views: currentViews + 1 }, { merge: true });
      } catch (innerErr) {
        console.warn('Could not increment view count in cloud:', innerErr);
      }
    }
  },

  // =========================================================================
  // USER READING PROGRESS (Real-time Cloud Sync per User & Book)
  // =========================================================================
  async saveUserProgress(userId: string, bookId: string, currentPage: number, totalPages: number): Promise<void> {
    if (!userId || !bookId || currentPage < 1) return;
    const progressDocId = `${userId}_${bookId}`;
    const path = `user_progress/${progressDocId}`;

    const data: UserProgressData = {
      userId,
      bookId,
      currentPage,
      totalPages: totalPages || 1,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'user_progress', progressDocId), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getUserProgress(userId: string, bookId: string): Promise<number | null> {
    if (!userId || !bookId) return null;
    const progressDocId = `${userId}_${bookId}`;
    try {
      const snap = await getDoc(doc(db, 'user_progress', progressDocId));
      if (snap.exists()) {
        const data = snap.data() as UserProgressData;
        if (data.currentPage && data.currentPage > 0) {
          return data.currentPage;
        }
      }
    } catch (err) {
      const isUnavailable = (err as any)?.code === 'unavailable' || String(err).includes('unavailable');
      if (!isUnavailable) {
        handleFirestoreError(err, OperationType.GET, `user_progress/${progressDocId}`);
      }
    }
    return null;
  },

  // =========================================================================
  // CATEGORIES
  // =========================================================================
  subscribeCategories(onUpdate: (cats: Category[]) => void): Unsubscribe {
    const catsCol = collection(db, 'categories');

    return onSnapshot(
      catsCol,
      async (snapshot) => {
        if (snapshot.empty && !snapshot.metadata.fromCache) {
          try {
            for (const cat of INITIAL_CATEGORIES) {
              await setDoc(doc(db, 'categories', cat.id), sanitizeForFirestore(cat));
            }
            onUpdate(INITIAL_CATEGORIES);
          } catch (seedErr) {
            const isUnavailable = (seedErr as any)?.code === 'unavailable' || String(seedErr).includes('unavailable');
            if (!isUnavailable) {
              handleFirestoreError(seedErr, OperationType.WRITE, 'categories');
            }
            onUpdate(INITIAL_CATEGORIES);
          }
          return;
        }

        const list: Category[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Category);
        });
        onUpdate(list);
      },
      (error) => {
        const isUnavailable = (error as any)?.code === 'unavailable' || String(error).includes('unavailable');
        if (isUnavailable) {
          console.warn('Firestore categories running in offline mode.');
        } else {
          try {
            handleFirestoreError(error, OperationType.LIST, 'categories');
          } catch (e) {
            console.warn('Firestore categories sync warning:', e);
          }
        }
      }
    );
  },

  async saveCategory(category: Category): Promise<void> {
    const path = `categories/${category.id}`;
    try {
      await setDoc(doc(db, 'categories', category.id), sanitizeForFirestore(category), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const path = `categories/${categoryId}`;
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },

  // =========================================================================
  // AUTHORS
  // =========================================================================
  subscribeAuthors(onUpdate: (authors: Author[]) => void): Unsubscribe {
    const authorsCol = collection(db, 'authors');

    return onSnapshot(
      authorsCol,
      async (snapshot) => {
        if (snapshot.empty && !snapshot.metadata.fromCache) {
          try {
            for (const auth of INITIAL_AUTHORS) {
              await setDoc(doc(db, 'authors', auth.id), sanitizeForFirestore(auth));
            }
            onUpdate(INITIAL_AUTHORS);
          } catch (seedErr) {
            const isUnavailable = (seedErr as any)?.code === 'unavailable' || String(seedErr).includes('unavailable');
            if (!isUnavailable) {
              handleFirestoreError(seedErr, OperationType.WRITE, 'authors');
            }
            onUpdate(INITIAL_AUTHORS);
          }
          return;
        }

        const list: Author[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Author);
        });
        onUpdate(list);
      },
      (error) => {
        const isUnavailable = (error as any)?.code === 'unavailable' || String(error).includes('unavailable');
        if (isUnavailable) {
          console.warn('Firestore authors running in offline mode.');
        } else {
          try {
            handleFirestoreError(error, OperationType.LIST, 'authors');
          } catch (e) {
            console.warn('Firestore authors sync warning:', e);
          }
        }
      }
    );
  },

  async saveAuthor(author: Author): Promise<void> {
    const path = `authors/${author.id}`;
    try {
      await setDoc(doc(db, 'authors', author.id), sanitizeForFirestore(author), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }
};
