
-- Add design_system column to projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS design_system JSONB DEFAULT '{"colors": [], "fonts": []}'::jsonb;
