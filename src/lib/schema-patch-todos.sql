-- Add tasks column to projects table
alter table projects 
add column if not exists tasks jsonb default '[]'::jsonb;
