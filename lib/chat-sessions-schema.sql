-- Add session_id and title columns to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS title TEXT;

-- Create an index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);

-- Update existing rows to have a title (optional, can be NULL)
-- We can't easily generate titles for existing rows in SQL without AI, so we'll leave them NULL or set a default
UPDATE chat_sessions SET title = 'Untitled Chat' WHERE title IS NULL;
