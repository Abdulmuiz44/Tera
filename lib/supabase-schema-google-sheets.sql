-- Create user_integrations table for storing Google OAuth tokens
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Create google_spreadsheets table to track spreadsheets created by users
CREATE TABLE IF NOT EXISTS google_spreadsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spreadsheet_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, spreadsheet_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_google_spreadsheets_user_id ON google_spreadsheets(user_id);
CREATE INDEX IF NOT EXISTS idx_google_spreadsheets_created_at ON google_spreadsheets(created_at);

-- Enable RLS (Row Level Security) if not already enabled
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_spreadsheets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to see only their own integrations
CREATE POLICY "Users can view their own integrations" ON user_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON user_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON user_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to see only their own spreadsheets
CREATE POLICY "Users can view their own spreadsheets" ON google_spreadsheets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spreadsheets" ON google_spreadsheets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spreadsheets" ON google_spreadsheets
  FOR DELETE USING (auth.uid() = user_id);
