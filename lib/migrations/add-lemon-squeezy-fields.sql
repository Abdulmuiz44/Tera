-- Add Lemon Squeezy subscription fields to users table
-- This migration adds fields for tracking subscription status and Lemon Squeezy integration

ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemon_squeezy_order_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_renewal_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_lemon_squeezy_customer_id ON users(lemon_squeezy_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_lemon_squeezy_subscription_id ON users(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
