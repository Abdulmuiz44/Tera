-- Add index for faster memory retrieval
CREATE INDEX IF NOT EXISTS idx_user_memories_user_created ON user_memories(user_id, created_at DESC);

-- Add index for faster chat history retrieval  
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created ON chat_sessions(user_id, created_at DESC);

-- Add session_id column to chat_sessions if not exists (for grouping conversations)
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS session_id UUID;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
