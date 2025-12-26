-- Add Onboarding Guide storage to projects
alter table projects
add column if not exists onboarding_guide text,
add column if not exists onboarding_generated_at timestamptz;
