-- Jury members with magic-link auth (no Keycloak account required)
CREATE TABLE jury_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,  -- optional Keycloak account
  name              VARCHAR(255) NOT NULL,
  title             VARCHAR(500),
  company           VARCHAR(255),
  avatar_url        TEXT,
  bio               TEXT,
  edition_number    INT NOT NULL,
  is_head_jury      BOOLEAN NOT NULL DEFAULT false,
  -- Magic link auth (TTL = hackathon end + 7 days)
  magic_token       VARCHAR(255) UNIQUE,
  token_expires_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jury_edition ON jury_members(edition_number);
CREATE INDEX idx_jury_token ON jury_members(magic_token) WHERE magic_token IS NOT NULL;

-- Dynamic scoring categories per edition (replaces hardcoded 4 columns in jury_scores)
CREATE TABLE scoring_categories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_number   INT NOT NULL,
  name             VARCHAR(255) NOT NULL,   -- 'Innowacyjność'
  key              VARCHAR(100) NOT NULL,   -- 'innovation'
  description      TEXT,
  max_score        INT NOT NULL DEFAULT 20,
  weight           DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(edition_number, key)
);

-- Additive columns on existing jury_scores table
-- (existing 4 score columns remain for backward compat)
ALTER TABLE jury_scores
  ADD COLUMN IF NOT EXISTS jury_member_id UUID REFERENCES jury_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scores JSONB;   -- {"innovation": 18, "technical_value": 15, ...}
