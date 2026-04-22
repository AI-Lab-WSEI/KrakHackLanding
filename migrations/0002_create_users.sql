-- User accounts with Keycloak SSO integration
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'participant', 'jury');

CREATE TABLE users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_id              VARCHAR(255) UNIQUE,
  email                    VARCHAR(255) UNIQUE NOT NULL,
  display_name             VARCHAR(255),
  avatar_url               TEXT,
  role                     user_role NOT NULL DEFAULT 'participant',
  bio                      TEXT,
  github_url               TEXT,
  linkedin_url             TEXT,
  university               VARCHAR(255),
  graduation_year          INT,
  skills                   JSONB NOT NULL DEFAULT '[]',
  is_active                BOOLEAN NOT NULL DEFAULT true,
  -- Onboarding via invite
  invite_token             VARCHAR(255) UNIQUE,
  invite_token_expires_at  TIMESTAMPTZ,
  onboarding_completed     BOOLEAN NOT NULL DEFAULT false,
  -- Legacy data links (nullable — populated on opt-in activation)
  submission_id            UUID,
  membership_app_id        UUID,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_keycloak_id ON users(keycloak_id) WHERE keycloak_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
