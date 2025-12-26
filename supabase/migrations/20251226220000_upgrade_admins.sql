-- 1. Relax the constraint to allow 'founder' (and 'pro' if not already)
alter table profiles drop constraint if exists profiles_tier_check;
alter table profiles add constraint profiles_tier_check 
  check (tier in ('free', 'pro', 'founder'));

-- 2. Upgrade Admins to Founder Tier (Unlimited)
update profiles
set tier = 'founder',
    usage_limit_chat = 999999,
    usage_limit_insight = 999999
where email in ('sergio@ideapunkt.de', 'sergio@liid.mx');
