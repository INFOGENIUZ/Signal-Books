-- Cloudflare D1 Migration Schema for Signal Books AI Knowledge Assistant

-- 1. Knowledge Sources Table
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'official', -- 'official', 'curated', 'external'
  url TEXT,
  author TEXT,
  license TEXT,
  status TEXT NOT NULL DEFAULT 'indexed', -- 'pending', 'processing', 'indexed', 'failed'
  chunk_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Knowledge Chunks Table (for RAG Retrieval)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT NOT NULL, -- JSON string containing title, author, category, url, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES knowledge_sources(id) ON DELETE CASCADE
);

-- 3. Chat Sessions & History Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'anonymous',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Chat Messages History Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'user' or 'ai'
  message TEXT NOT NULL,
  sources_used TEXT, -- JSON array of citation objects
  response_time_ms INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 5. Analytics & Search Logs Table
CREATE TABLE IF NOT EXISTS search_analytics (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  matched_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ultra-fast query execution
CREATE INDEX IF NOT EXISTS idx_chunks_source ON knowledge_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_query ON search_analytics(query);
