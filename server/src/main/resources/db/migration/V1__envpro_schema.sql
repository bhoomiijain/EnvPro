-- EnvPro PostgreSQL schema (docs/database-schema.sql + fields for UI + migration-aware rollback)

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE environments (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects (id),
    env_key TEXT NOT NULL UNIQUE,
    branch TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    commit_message TEXT,
    author TEXT,
    status TEXT NOT NULL,
    health TEXT NOT NULL,
    preview_url TEXT,
    port INTEGER,
    ttl_seconds INTEGER NOT NULL,
    auto_destroy_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    healthy_at TIMESTAMPTZ,
    destroyed_at TIMESTAMPTZ,
    docker_image TEXT,
    cpu_percent NUMERIC(5, 2) DEFAULT 0,
    ram_percent NUMERIC(5, 2) DEFAULT 0,
    ram_mb INTEGER DEFAULT 512,
    latest_failure_cause TEXT,
    tests_passed INTEGER DEFAULT 0,
    tests_failed INTEGER DEFAULT 0,
    image_size_label TEXT,
    build_duration_seconds INTEGER,
    build_stage TEXT
);

CREATE TABLE environment_revisions (
    id UUID PRIMARY KEY,
    environment_id UUID NOT NULL REFERENCES environments (id) ON DELETE CASCADE,
    commit_sha TEXT NOT NULL,
    docker_image TEXT,
    db_migration_version TEXT,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE environment_events (
    id UUID PRIMARY KEY,
    environment_id UUID NOT NULL REFERENCES environments (id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE log_entries (
    id BIGSERIAL PRIMARY KEY,
    environment_id UUID NOT NULL REFERENCES environments (id) ON DELETE CASCADE,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resource_samples (
    id BIGSERIAL PRIMARY KEY,
    environment_id UUID NOT NULL REFERENCES environments (id) ON DELETE CASCADE,
    cpu_percent NUMERIC(5, 2) NOT NULL,
    ram_percent NUMERIC(5, 2) NOT NULL,
    sampled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_environments_project ON environments (project_id);
CREATE INDEX idx_environments_status ON environments (status);
CREATE INDEX idx_env_rev_env ON environment_revisions (environment_id);
CREATE INDEX idx_env_events_env ON environment_events (environment_id);
CREATE INDEX idx_logs_env ON log_entries (environment_id);
CREATE INDEX idx_logs_created ON log_entries (created_at DESC);
