-- EnvPro industry-style schema (PostgreSQL)

create table projects (
  id uuid primary key,
  name text not null,
  repo_url text not null,
  created_at timestamptz not null default now()
);

create table environments (
  id uuid primary key,
  project_id uuid not null references projects(id),
  env_key text not null unique,
  branch text not null,
  commit_sha text not null,
  status text not null,
  health text not null,
  preview_url text,
  port integer,
  ttl_seconds integer not null,
  auto_destroy_at timestamptz,
  created_at timestamptz not null default now(),
  healthy_at timestamptz,
  destroyed_at timestamptz
);

create table environment_revisions (
  id uuid primary key,
  environment_id uuid not null references environments(id) on delete cascade,
  commit_sha text not null,
  source text not null, -- deploy|rollback
  created_at timestamptz not null default now()
);

create table environment_events (
  id uuid primary key,
  environment_id uuid not null references environments(id) on delete cascade,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table log_entries (
  id bigserial primary key,
  environment_id uuid not null references environments(id) on delete cascade,
  level text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table resource_samples (
  id bigserial primary key,
  environment_id uuid not null references environments(id) on delete cascade,
  cpu_percent numeric(5,2) not null,
  ram_percent numeric(5,2) not null,
  sampled_at timestamptz not null default now()
);
