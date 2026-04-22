-- Project portfolio — personal, team, and hackathon projects
CREATE TYPE project_status AS ENUM ('draft', 'active', 'published', 'maintained', 'archived');
CREATE TYPE project_visibility AS ENUM ('private', 'members_only', 'public');
CREATE TYPE project_type AS ENUM ('personal', 'team', 'hackathon');

CREATE TABLE projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             VARCHAR(255) UNIQUE NOT NULL,
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  status           project_status NOT NULL DEFAULT 'draft',
  visibility       project_visibility NOT NULL DEFAULT 'private',
  project_type     project_type NOT NULL DEFAULT 'personal',

  -- Hackathon link (NULL for non-hackathon projects)
  edition_number   INT,
  team_project_id  UUID,  -- FK to legacy team_projects.id, populated during Faza 4 migration

  -- Ownership
  owner_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id          UUID,  -- FK added after teams table created (see 0004)

  -- Metadata
  tags             TEXT[] NOT NULL DEFAULT '{}',
  tech_stack       TEXT[] NOT NULL DEFAULT '{}',
  github_url       TEXT,
  demo_url         TEXT,
  thumbnail_url    TEXT,
  images           JSONB NOT NULL DEFAULT '[]',

  -- Hackathon-specific (NULL for non-hackathon)
  challenge_slug   VARCHAR(255),
  placement        INT,
  placement_label  VARCHAR(100),
  special_mention  VARCHAR(500),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_owner ON projects(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_projects_edition ON projects(edition_number) WHERE edition_number IS NOT NULL;
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);
