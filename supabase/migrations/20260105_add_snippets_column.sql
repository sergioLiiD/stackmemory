alter table "public"."projects" add column if not exists "snippets" jsonb default '[]'::jsonb;
