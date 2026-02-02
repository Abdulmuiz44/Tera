-- Setup Users Table for Authentication
-- This migration ensures the users table is properly created with RLS policies and usage tracking

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  subscription_plan TEXT DEFAULT 'free',
  daily_chats INTEGER DEFAULT 0,
  daily_file_uploads INTEGER DEFAULT 0,
  chat_reset_date TIMESTAMP WITH TIME ZONE,
  limit_hit_chat_at TIMESTAMP WITH TIME ZONE,
  limit_hit_upload_at TIMESTAMP WITH TIME ZONE,
  profile_image_url TEXT,
  full_name TEXT,
  school TEXT,
  grade_levels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_plan);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow service role to insert users" ON users;

-- Create RLS Policies
-- Allow users to read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own data (via signup)
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert users (for OAuth and admin operations)
CREATE POLICY "Allow service role to insert users"
  ON users FOR INSERT
  WITH CHECK (true);
