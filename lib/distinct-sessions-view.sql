-- Create a view to get distinct chat sessions with their latest details
CREATE OR REPLACE VIEW distinct_chat_sessions AS
SELECT DISTINCT ON (session_id)
  session_id,
  user_id,
  title,
  created_at,
  tool,
  prompt as last_message
FROM chat_sessions
WHERE session_id IS NOT NULL
ORDER BY session_id, created_at DESC;
