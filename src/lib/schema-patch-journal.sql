-- Add journal column to projects table
alter table projects add column if not exists journal jsonb default '[]'::jsonb;
