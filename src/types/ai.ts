export type KnowledgeSourceType = 'official' | 'curated' | 'external';
export type KnowledgeSourceStatus = 'pending' | 'processing' | 'indexed' | 'failed';

export interface KnowledgeMetadata {
  title: string;
  authorName?: string;
  categoryName?: string;
  genre?: string;
  language?: string;
  sourceType: KnowledgeSourceType;
  bookId?: string;
  documentId?: string;
  page?: number;
  url?: string;
  license?: string;
  collectedDate?: string;
}

export interface KnowledgeChunk {
  id: string;
  sourceId: string;
  content: string;
  metadata: KnowledgeMetadata;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  type: KnowledgeSourceType;
  url?: string;
  author?: string;
  license?: string;
  status: KnowledgeSourceStatus;
  chunkCount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  title: string;
  type: KnowledgeSourceType;
  url?: string;
  bookId?: string;
  page?: number;
  sourceName: string;
  license?: string;
}

export interface RecommendedBookRef {
  id: string;
  title: string;
  authorName: string;
  categoryName: string;
  coverUrl?: string;
  pages?: number;
  rating?: number;
  hasAudio?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  recommendedBooks?: RecommendedBookRef[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface AiChatStats {
  totalQuestionsToday: number;
  totalQuestionsAllTime: number;
  activeSessionsToday: number;
  avgResponseTimeMs: number;
  topSearchedQueries: Array<{ query: string; count: number }>;
  topSearchedBooks: Array<{ title: string; count: number }>;
}

export interface RagSearchRequest {
  query: string;
  limit?: number;
  minScore?: number;
  filterType?: KnowledgeSourceType;
}

export interface RagSearchResponse {
  query: string;
  chunks: KnowledgeChunk[];
  totalFound: number;
}
