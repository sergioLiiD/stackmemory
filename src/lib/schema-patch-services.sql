-- Add services column to projects table to store Service Locker data
alter table projects add column if not exists services jsonb default '[]'::jsonb;
