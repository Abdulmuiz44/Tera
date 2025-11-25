-- Add daily_file_uploads column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS daily_file_uploads INTEGER DEFAULT 0;

-- Update the existing increment_chats function or create a new one for file uploads if needed
-- For now, we'll handle incrementing in the application code using the direct update method
