-- Resize vector column for Gemini (768 dimensions)
-- WARNING: This deletes all existing embeddings!
TRUNCATE TABLE embeddings;
ALTER TABLE embeddings 
  ALTER COLUMN embedding TYPE vector(768);
