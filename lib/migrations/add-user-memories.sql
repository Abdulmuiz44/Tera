-- Create user_memories table
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  memory_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
CREATE POLICY "User memories own data" ON user_memories FOR ALL USING (auth.uid() = user_id);

-- Create Index
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
