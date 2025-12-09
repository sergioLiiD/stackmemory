
-- Add firebase_config support to projects table
alter table projects 
add column if not exists firebase_config jsonb default '{}'::jsonb;
