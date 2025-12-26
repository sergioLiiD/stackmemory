-- Create subscriptions table
create table if not exists subscriptions (
  id text primary key, -- LemonSqueezy Subscription ID
  user_id uuid references auth.users(id) not null,
  status text not null, -- active, past_due, unpad, cancelled, expired, on_trial, paused, paused_definitely
  variant_name text, -- e.g., "Pro Monthly", "LTD"
  renews_at timestamptz,
  ends_at timestamptz,
  update_payment_url text, -- Customer portal URL
  created_at timestamptz default now()
);

-- Enable RLS
alter table subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Create webhook_events table for debugging and idempotency
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS (Admin only essentially, but let's secure it)
alter table webhook_events enable row level security;

-- Only service role should really access this, but for now strict policy
create policy "Service role can all"
  on webhook_events for all
  using (auth.role() = 'service_role');
