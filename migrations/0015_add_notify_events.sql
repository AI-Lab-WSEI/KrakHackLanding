-- Faza 9: Email notifications for new events
-- Users can toggle opt-in via /panel/profil. Default TRUE (opted-in) — backwards compat.
-- events.notified_at tracks whether the admin has broadcast the event.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_events BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS notified_count INT NOT NULL DEFAULT 0;
