-- Create usage_logs table for audit and cost tracking
create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id text, -- Can be null for account-level actions
  action text not null, -- 'chat', 'insight', 'embedding'
  model text,
  input_tokens int default 0,
  output_tokens int default 0,
  cost_estimated float default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table usage_logs enable row level security;

-- Admin/Service Role can view all
create policy "Admins can view all usage logs"
  on usage_logs for select
  using (
    auth.jwt() ->> 'email' in ('sergio@ideapunkt.de', 'sergio@liid.mx') -- Hardcoded admin emails for now or use app_metadata
    or
    auth.role() = 'service_role'
  );

-- Users can view their own logs (optional, for "Usage" page)
create policy "Users can view own usage logs"
  on usage_logs for select
  using (auth.uid() = user_id);

-- Add Limit Tracking to Profiles
-- Default Limits: Free tier assumed
alter table profiles 
add column if not exists usage_limit_chat int default 20, -- 20 chats / month free
add column if not exists usage_limit_insight int default 3, -- 3 insights / month free
add column if not exists usage_count_chat int default 0,
add column if not exists usage_count_insight int default 0,
add column if not exists limit_reset_at timestamptz default (now() + interval '1 month');

-- Index for analytics
create index idx_usage_logs_user_id on usage_logs(user_id);
create index idx_usage_logs_created_at on usage_logs(created_at);
