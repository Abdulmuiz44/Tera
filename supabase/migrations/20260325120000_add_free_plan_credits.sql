-- Credit-based throttling for Free plan while keeping chats technically unlimited.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS free_plan_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_plan_credits_reset_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_users_free_plan_credits_reset_date ON users(free_plan_credits_reset_date);

COMMENT ON COLUMN users.free_plan_credits_used IS 'Number of free-plan credits consumed in current monthly window';
COMMENT ON COLUMN users.free_plan_credits_reset_date IS 'Date when free-plan credits reset';
