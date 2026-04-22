-- Faza 8: profile_slug for human-readable participant profile URLs
-- Auto-populated when user sets display_name (in /api/panel/me, /api/invite/complete)

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_slug VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_profile_slug ON users(profile_slug)
  WHERE profile_slug IS NOT NULL;
