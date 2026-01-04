-- Add mcps column to projects table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'mcps'
    ) THEN
        ALTER TABLE projects ADD COLUMN mcps JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
