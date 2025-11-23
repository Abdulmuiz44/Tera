-- Create a storage bucket for attachments
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

-- Allow public access to attachments (for reading)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'attachments' );

-- Allow anonymous uploads (since API route uses anon key without user context)
-- In a production app, we would pass the user token or use a service role key.
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'attachments' );
