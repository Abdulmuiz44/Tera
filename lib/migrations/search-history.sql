-- Create search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_count INT DEFAULT 0,
  filters JSONB, -- Stores type, dateRange, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add index for faster history retrieval
  CONSTRAINT search_history_user_id_created_at_idx UNIQUE (user_id, created_at)
);

-- Separate index on user_id if needed for other queries
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);

-- Create search bookmarks table
CREATE TABLE IF NOT EXISTS search_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  source TEXT,
  notes TEXT,
  tags TEXT[], -- Array of strings for tagging
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for retrieving user bookmarks
CREATE INDEX IF NOT EXISTS idx_search_bookmarks_user_id ON search_bookmarks(user_id);
-- Index for checking if specific URL is bookmarked by user
CREATE INDEX IF NOT EXISTS idx_search_bookmarks_user_url ON search_bookmarks(user_id, url);

-- Comments for documentation
COMMENT ON TABLE search_history IS 'Stores user web search history';
COMMENT ON TABLE search_bookmarks IS 'Stores saved web search results';
