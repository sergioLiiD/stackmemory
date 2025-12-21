-- Add has_updates column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS has_updates BOOLEAN DEFAULT FALSE;

-- Comment on column
COMMENT ON COLUMN projects.has_updates IS 'Flag indicating if any stack dependencies have updates available';
