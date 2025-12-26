-- Create a new storage bucket for chat attachments
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true);

-- Policy: Allow public read access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'chat-attachments' );

-- Policy: Allow authenticated users to upload
create policy "Authenticated Upload"
on storage.objects for insert
with check (
  bucket_id = 'chat-attachments'
  and auth.role() = 'authenticated'
);

-- Policy: Allow users to update their own files (optional, but good for retries)
create policy "Owner Update"
on storage.objects for update
using (
  bucket_id = 'chat-attachments'
  and auth.uid() = owner
);

-- Policy: Allow users to delete their own files
create policy "Owner Delete"
on storage.objects for delete
using (
  bucket_id = 'chat-attachments'
  and auth.uid() = owner
);
