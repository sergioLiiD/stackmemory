-- Add updated_at column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Comment
COMMENT ON COLUMN projects.updated_at IS 'Timestamp of the last update to the project';
