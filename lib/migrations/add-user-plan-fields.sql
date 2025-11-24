-- Migration: Add user plan and usage tracking fields
-- Created: 2025-11-24

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS monthly_lesson_plans INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_chats INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS grade_levels TEXT[];

-- Add check constraint for valid plans
ALTER TABLE users
ADD CONSTRAINT valid_subscription_plan 
CHECK (subscription_plan IN ('free', 'pro', 'school'));

-- Create index for plan queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_plan_reset_date ON users(plan_reset_date);

-- Update RLS policies to allow users to update their own profile
-- (Users can view own data policy already exists)
-- (Users can update own data policy already exists)

COMMENT ON COLUMN users.subscription_plan IS 'User subscription plan: free, pro, or school';
COMMENT ON COLUMN users.monthly_lesson_plans IS 'Number of lesson plans generated this month';
COMMENT ON COLUMN users.monthly_chats IS 'Number of chats initiated this month';
COMMENT ON COLUMN users.plan_reset_date IS 'Date when usage counters will reset';
COMMENT ON COLUMN users.profile_image_url IS 'URL to user profile image';
COMMENT ON COLUMN users.full_name IS 'User full name';
COMMENT ON COLUMN users.school IS 'School or institution name';
COMMENT ON COLUMN users.grade_levels IS 'Array of grade levels taught';
