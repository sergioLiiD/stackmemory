-- Fix for ambiguous match_documents function
-- This occurs when there are two versions of the function with different parameter types

-- 1. Drop both possible versions to be safe (Cascade if necessary)
DROP FUNCTION IF EXISTS match_documents(vector(3072), float, int, uuid);
DROP FUNCTION IF EXISTS match_documents(vector(3072), float, int, text);
DROP FUNCTION IF EXISTS match_documents(vector(768), float, int, uuid);
DROP FUNCTION IF EXISTS match_documents(vector(768), float, int, text);
DROP FUNCTION IF EXISTS match_documents(vector, float, int, uuid);
DROP FUNCTION IF EXISTS match_documents(vector, float, int, text);

-- 2. Create the clean, definitive 3072-dimension version
-- Added explicit casting to avoid "operator does not exist: text = uuid"
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  filter_project_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  file_path text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    embeddings.id,
    embeddings.content,
    embeddings.file_path,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE embeddings.project_id::uuid = filter_project_id::uuid
    AND 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
