-- Migration to add insight_report column to projects table
alter table "public"."projects"
add column "insight_report" text null,
add column "insight_generated_at" timestamp with time zone null;
