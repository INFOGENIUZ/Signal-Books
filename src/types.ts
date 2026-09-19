export type BookFormat = 'PDF' | 'EPUB' | 'AUDIO' | 'TXT';
export type BookLanguage = 'O‘zbekcha' | 'Ruscha' | 'Inglizcha';

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  birthYear?: number;
  deathYear?: number;
  booksCount: number;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  booksCount?: number;
  description?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  booksCount: number;
  color?: string;
  description?: string;
  subcategories?: SubCategory[];
}

export interface Chapter {
  id: string;
  title: string;
  pageNumber: number;
  content?: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  description: string;
  coverUrl: string;
  pdfUrl?: string;
  googleDriveUrl?: string;
  audioUrl?: string;
  audioDuration?: string; // e.g. "5 soat 42 daqiqa"
  hasAudio?: boolean;
  language: BookLanguage;
  publicationYear: number;
  pages: number;
  isbn: string;
  fileSize: string;
  format: BookFormat[];
  rating: number;
  ratingsCount: number;
  views: number;
  downloads: number;
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
  chapters?: Chapter[];
  sampleContent?: string[];
}

export interface ReadingHistoryItem {
  bookId: string;
  bookTitle: string;
  authorName: string;
  coverUrl: string;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  lastReadAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar: string;
  joinedDate: string;
  stats: {
    booksRead: number;
    readingHours: number;
    favoriteCount: number;
    audioListenedHours: number;
  };
}

export interface AudioTrack {
  id: string;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  duration: number; // in seconds
  audioSrc?: string;
  narrator?: string;
}

export type ActivePage = 
  | 'home' 
  | 'books' 
  | 'categories' 
  | 'category-details'
  | 'audio' 
  | 'favorites' 
  | 'history' 
  | 'about' 
  | 'book-details' 
  | 'profile' 
  | 'admin';
