-- Remove foreign key constraint from users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Make sure id is still primary key (it should be)
-- If not: ALTER TABLE users ADD PRIMARY KEY (id);

-- Update RLS policies to working with custom JWTs or just rely on API routes (Application Logic)
-- If we want to keep using RLS with custom JWT, we need to ensure the JWT 'sub' claim matches the user 'id'.

-- For now, removing the constraint allows us to insert users that don't exist in auth.users.
