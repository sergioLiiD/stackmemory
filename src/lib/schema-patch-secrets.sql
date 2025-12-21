-- Add secrets column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS secrets JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN projects.secrets IS 'List of secret metadata (keys and environments only)';
