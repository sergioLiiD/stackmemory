create table if not exists "public"."workflows" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null references "public"."projects"("id") on delete cascade,
    "name" text not null,
    "content" jsonb not null default '{}'::jsonb, -- The raw n8n JSON
    "nodes_index" jsonb default '[]'::jsonb, -- Array of node types for search
    "credentials_needed" jsonb default '[]'::jsonb, -- Array of extracted credential names
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    primary key ("id")
);

alter table "public"."workflows" enable row level security;

create policy "Users can view their own project workflows"
on "public"."workflows"
as permissive
for select
to authenticated
using (
    exists (
        select 1 from "public"."projects"
        where "projects"."id" = "workflows"."project_id"
        and "projects"."user_id" = auth.uid()
    )
);

create policy "Users can insert their own project workflows"
on "public"."workflows"
as permissive
for insert
to authenticated
with check (
    exists (
        select 1 from "public"."projects"
        where "projects"."id" = "workflows"."project_id"
        and "projects"."user_id" = auth.uid()
    )
);

create policy "Users can update their own project workflows"
on "public"."workflows"
as permissive
for update
to authenticated
using (
    exists (
        select 1 from "public"."projects"
        where "projects"."id" = "workflows"."project_id"
        and "projects"."user_id" = auth.uid()
    )
);

create policy "Users can delete their own project workflows"
on "public"."workflows"
as permissive
for delete
to authenticated
using (
    exists (
        select 1 from "public"."projects"
        where "projects"."id" = "workflows"."project_id"
        and "projects"."user_id" = auth.uid()
    )
);
