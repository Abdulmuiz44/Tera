-- Add web search usage columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS monthly_web_searches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS web_search_reset_date TIMESTAMP DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_web_search_usage ON users(monthly_web_searches, web_search_reset_date);
