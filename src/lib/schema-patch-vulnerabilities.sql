-- Add has_vulnerabilities to projects table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'has_vulnerabilities') THEN
        ALTER TABLE projects ADD COLUMN has_vulnerabilities boolean DEFAULT false;
    END IF;
END $$;
