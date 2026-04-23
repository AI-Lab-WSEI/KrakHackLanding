-- Faza 10.5: attendance confirmations per-user, per-edition.
-- User (hackathon-participant) wchodzi na /panel/moja-obecnosc i potwierdza
-- że pracuje nad projektem w danej edycji. Admin widzi read-only dashboard.
-- To jest warunek do wystawienia certyfikatu po hackathonie.

CREATE TABLE IF NOT EXISTS attendance_confirmations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edition_number   INT NOT NULL,
  confirmed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note             TEXT,

  UNIQUE (user_id, edition_number)
);

CREATE INDEX IF NOT EXISTS idx_attendance_confirmations_edition
  ON attendance_confirmations(edition_number);

CREATE INDEX IF NOT EXISTS idx_attendance_confirmations_user
  ON attendance_confirmations(user_id);
