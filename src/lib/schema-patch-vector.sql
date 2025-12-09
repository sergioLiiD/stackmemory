-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  project_id text not null, -- Can be uuid if we migrated projects to DB, keeping text for flexibility with mock hybrid
  content text, -- The actual text content of the code chunk
  file_path text, -- e.g. "src/lib/utils.ts"
  metadata jsonb, -- e.g. { "language": "typescript", "lines": [10, 50] }
  embedding vector(1536), -- 1536 dimensions for text-embedding-ada-002 (OpenAI)
  created_at timestamptz default now()
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project_id text
)
returns table (
  id uuid,
  content text,
  file_path text,
  similarity float
)
language plpgsql
as $$
begin
  return query(
    select
      embeddings.id,
      embeddings.content,
      embeddings.file_path,
      1 - (embeddings.embedding <=> query_embedding) as similarity
    from embeddings
    where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
    and embeddings.project_id = filter_project_id
    order by embeddings.embedding <=> query_embedding
    limit match_count
  );
end;
$$;
