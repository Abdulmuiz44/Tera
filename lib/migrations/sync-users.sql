-- Sync missing users from auth.users to public.users
-- This script inserts users that exist in Supabase Auth but are missing from the public.users table

INSERT INTO public.users (
  id,
  email,
  subscription_plan,
  daily_chats,
  daily_file_uploads,
  created_at,
  profile_image_url,
  full_name
)
SELECT 
  id,
  email,
  'free', -- Default plan
  0,      -- Default daily chats
  0,      -- Default daily uploads
  created_at,
  raw_user_meta_data->>'avatar_url',
  raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 
  (SELECT count(*) FROM auth.users) as auth_users_count,
  (SELECT count(*) FROM public.users) as public_users_count;
