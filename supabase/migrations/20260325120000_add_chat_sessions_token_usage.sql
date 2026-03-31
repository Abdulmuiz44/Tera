-- Ensure chat_sessions tracks token usage for profile daily aggregation.
-- Safe for existing deployments where the column may be absent or nullable.

ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS token_usage INTEGER DEFAULT 0;

-- Backfill old rows (and any nullable values) before enforcing NOT NULL.
UPDATE chat_sessions
SET token_usage = 0
WHERE token_usage IS NULL;

ALTER TABLE chat_sessions
ALTER COLUMN token_usage SET DEFAULT 0,
ALTER COLUMN token_usage SET NOT NULL;

-- Helps fetchDailyTokenUsage aggregate by user/day window.
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id_created_at
ON chat_sessions (user_id, created_at);
