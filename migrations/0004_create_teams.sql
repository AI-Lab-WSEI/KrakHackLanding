-- Teams — groups of users working on shared projects
CREATE TABLE teams (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  description      TEXT,
  avatar_url       TEXT,
  edition_number   INT,  -- NULL for non-hackathon teams
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(50) NOT NULL DEFAULT 'member',  -- 'captain' | 'member'
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Wire projects.team_id FK now that teams table exists
ALTER TABLE projects
  ADD CONSTRAINT fk_projects_team
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
