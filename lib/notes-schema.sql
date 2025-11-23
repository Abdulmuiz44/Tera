-- Notes table migration
-- Run this file to add the notes table without affecting existing data

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own notes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Notes own data'
    ) THEN
        CREATE POLICY "Notes own data" ON notes FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
