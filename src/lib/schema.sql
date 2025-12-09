-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Projects Table: Stores the core entity
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  repository_url text,
  live_url text,
  status text check (status in ('active', 'archived', 'planning', 'legacy')) default 'active',
  is_favorite boolean default false,
  health_score integer default 100,
  
  -- The tech stack will be stored as a JSONB array for flexibility
  -- Example: [{"name": "Next.js", "version": "14.0", "type": "frontend"}]
  stack jsonb default '[]'::jsonb
);

-- Semantic Search: Code Embeddings Table
create table code_embeddings (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  file_path text not null,
  content text,                    -- The actual code snippet
  embedding vector(1536),          -- Compatible with OpenAI text-embedding-3-small
  
  -- Metadata for filtering
  language text
);

-- Index for fast semantic search
create index on code_embeddings using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Row Level Security (RLS) Policies
-- For now, we allow public read/write to simplify development. 
-- In production, strict policies based on auth.uid() are required.

alter table projects enable row level security;
alter table code_embeddings enable row level security;

-- OPEN POLICY (Dev Mode Only)
create policy "Allow public access for dev"
  on projects
  for all
  using (true)
  with check (true);

create policy "Allow public access for embeddings"
  on code_embeddings
  for all
  using (true)
  with check (true);
