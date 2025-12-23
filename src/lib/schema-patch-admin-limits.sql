-- Add custom_project_limit to profiles table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'custom_project_limit') THEN
        ALTER TABLE profiles ADD COLUMN custom_project_limit integer;
    END IF;
END $$;
