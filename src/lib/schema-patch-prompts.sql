-- Create table for storing saved prompts
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  project_id text not null, -- Keeping text to match our current project ID style (though often uuid)
  title text not null,
  prompt text not null,
  model text default 'GPT-4o',
  tags text[] default array[]::text[],
  created_at timestamptz default now()
);

-- Enable RLS
alter table prompts enable row level security;

-- Policies
-- (For MVP we allow authenticated users to do everything, assuming single tenant owner or strict app logic)
create policy "Enable all access for authenticated users" on prompts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
