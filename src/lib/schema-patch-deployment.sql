-- Add deployment metadata columns
alter table projects add column if not exists deploy_provider text;
alter table projects add column if not exists deploy_account text;
