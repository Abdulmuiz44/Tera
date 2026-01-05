-- Migration: Add 24-hour limit unlock tracking
-- Description: Adds columns to track when users hit limits for automatic 24-hour unlock

-- Add columns to track when limits were hit (for 24-hour unlock mechanism)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS limit_hit_chat_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS limit_hit_upload_at TIMESTAMP WITH TIME ZONE;

-- Add comments for clarity
COMMENT ON COLUMN users.limit_hit_chat_at IS 'Timestamp when user hit their daily chat limit (for 24-hour unlock)';
COMMENT ON COLUMN users.limit_hit_upload_at IS 'Timestamp when user hit their daily file upload limit (for 24-hour unlock)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_limit_hit_chat_at ON users(limit_hit_chat_at);
CREATE INDEX IF NOT EXISTS idx_users_limit_hit_upload_at ON users(limit_hit_upload_at);
