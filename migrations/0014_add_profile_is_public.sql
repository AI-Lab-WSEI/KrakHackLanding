-- Faza 9: Profile privacy toggle
-- Users can opt out of appearing on /uczestnicy and /uczestnicy/:slug
-- Default TRUE — existing participants already publicly visible keep their listing.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_users_is_public
  ON users(is_public)
  WHERE is_public = true;
