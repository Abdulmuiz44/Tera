-- Track per-response token usage so profile can show daily token progress
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS token_usage INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created_token_usage
ON chat_sessions(user_id, created_at);
