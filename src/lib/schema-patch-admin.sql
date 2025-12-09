-- Add admin flag to profiles
alter table profiles add column if not exists is_admin boolean default false;

-- Create Usage Logs table
create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  project_id text, -- ID of the project interacting with
  action text not null, -- 'embedding' or 'chat'
  model text not null, -- 'text-embedding-ada-002', 'gpt-4o-mini', etc.
  input_tokens int default 0,
  output_tokens int default 0,
  cost_estimated float default 0, -- Store the calculated cost at that moment
  created_at timestamptz default now()
);

-- RLS for Usage Logs
alter table usage_logs enable row level security;

-- Users can insert their own logs (application logic will handle this via service role usually, but safe to allow authenticated insert for their own)
create policy "Users can insert own logs"
  on usage_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admins can view all logs
create policy "Admins can view all logs"
  on usage_logs for select
  to authenticated
  using (
    (select is_admin from profiles where id = auth.uid()) = true
  );

-- Users can view their own logs (optional, for "My Usage" page)
create policy "Users can view own logs"
  on usage_logs for select
  to authenticated
  using (auth.uid() = user_id);
