-- Add user_id to projects table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'user_id') THEN
        ALTER TABLE projects ADD COLUMN user_id uuid references auth.users not null default auth.uid();
    END IF;
END $$;

-- Update RLS Policies to be user-specific
DROP POLICY IF EXISTS "Allow public access for dev" ON projects;

CREATE POLICY "Enable read access for own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
