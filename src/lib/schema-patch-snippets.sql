
-- Snippets table for Project Cheatsheet
CREATE TABLE IF NOT EXISTS public.snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'bash',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own project snippets"
  ON public.snippets for ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.projects WHERE id = snippets.project_id
    )
  );
