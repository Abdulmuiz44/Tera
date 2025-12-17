-- Migration: Update schema for strict limit enforcement
-- Description: Adds tracking columns for file uploads and web searches, and updates plan constraints to include 'plus'.

-- 1. update valid plans constraint to include 'plus'
ALTER TABLE users
DROP CONSTRAINT IF EXISTS valid_subscription_plan;

ALTER TABLE users
ADD CONSTRAINT valid_subscription_plan 
CHECK (subscription_plan IN ('free', 'pro', 'plus', 'school'));

-- 2. Add columns for file upload tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS daily_file_uploads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS upload_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day');

-- 3. Add columns for web search tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS monthly_web_searches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS web_search_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month');

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_upload_reset_date ON users(upload_reset_date);
CREATE INDEX IF NOT EXISTS idx_users_web_search_reset_date ON users(web_search_reset_date);

-- 5. Add comments for clarity
COMMENT ON COLUMN users.daily_file_uploads IS 'Number of files uploaded today';
COMMENT ON COLUMN users.upload_reset_date IS 'Date when file upload counter will reset (daily)';
COMMENT ON COLUMN users.monthly_web_searches IS 'Number of web searches performed this month';
COMMENT ON COLUMN users.web_search_reset_date IS 'Date when web search counter will reset (monthly)';
