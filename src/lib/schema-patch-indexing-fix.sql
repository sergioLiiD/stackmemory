-- 1. Add last_indexed_at to projects table for reliable persistence
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'last_indexed_at') THEN
        ALTER TABLE projects ADD COLUMN last_indexed_at timestamptz;
    END IF;
END $$;

-- 2. Fix match_documents RPC dimension mismatch
-- The table uses vector(768) from text-embedding-004, but the RPC was expecting 1536.
DROP FUNCTION IF EXISTS match_documents(vector, float, int, text);

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768), -- CHANGED: Matches text-embedding-004
  match_threshold float,
  match_count int,
  filter_project_id text
)
RETURNS TABLE (
  id uuid,
  content text,
  file_path text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY(
    SELECT
      embeddings.id,
      embeddings.content,
      embeddings.file_path,
      1 - (embeddings.embedding <=> query_embedding) AS similarity
    FROM embeddings
    WHERE 1 - (embeddings.embedding <=> query_embedding) > match_threshold
    AND embeddings.project_id = filter_project_id
    ORDER BY embeddings.embedding <=> query_embedding
    LIMIT match_count
  );
END;
$$;
