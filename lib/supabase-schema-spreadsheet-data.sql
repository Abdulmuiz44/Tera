-- Add columns to google_spreadsheets table to store current data and edit history
ALTER TABLE google_spreadsheets 
ADD COLUMN IF NOT EXISTS current_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_being_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Create spreadsheet_edits table to track all changes
CREATE TABLE IF NOT EXISTS spreadsheet_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spreadsheet_id TEXT NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  operation_data JSONB NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id, spreadsheet_id) REFERENCES google_spreadsheets(user_id, spreadsheet_id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_spreadsheet_edits_user_id ON spreadsheet_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_edits_spreadsheet_id ON spreadsheet_edits(spreadsheet_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_edits_created_at ON spreadsheet_edits(created_at);
CREATE INDEX IF NOT EXISTS idx_google_spreadsheets_current_data ON google_spreadsheets USING gin(current_data);
CREATE INDEX IF NOT EXISTS idx_google_spreadsheets_edit_history ON google_spreadsheets USING gin(edit_history);

-- Enable RLS on spreadsheet_edits
ALTER TABLE spreadsheet_edits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for spreadsheet_edits
CREATE POLICY "Users can view their own edits" ON spreadsheet_edits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own edits" ON spreadsheet_edits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update existing RLS on google_spreadsheets to allow edits
DROP POLICY IF EXISTS "Users can view their own spreadsheets" ON google_spreadsheets;
DROP POLICY IF EXISTS "Users can update their own spreadsheets" ON google_spreadsheets;
DROP POLICY IF EXISTS "Users can insert their own spreadsheets" ON google_spreadsheets;
DROP POLICY IF EXISTS "Users can delete their own spreadsheets" ON google_spreadsheets;

CREATE POLICY "Users can view their own spreadsheets" ON google_spreadsheets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own spreadsheets" ON google_spreadsheets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spreadsheets" ON google_spreadsheets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spreadsheets" ON google_spreadsheets
  FOR DELETE USING (auth.uid() = user_id);
