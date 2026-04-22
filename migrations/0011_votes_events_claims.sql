-- Faza 6: participant voting + team claims
-- Faza 7: events table (already created in 0007) — no changes needed

-- ─── Participant votes (people's choice) ──────────────────────────────────────
CREATE TABLE participant_votes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edition_number INT NOT NULL,
  team_slug      VARCHAR(100) NOT NULL,  -- references team_projects.slug
  voted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, edition_number)  -- one vote per user per edition
);
CREATE INDEX idx_votes_edition      ON participant_votes(edition_number);
CREATE INDEX idx_votes_edition_team ON participant_votes(edition_number, team_slug);

-- ─── Team claims (participants link themselves to legacy team_projects) ────────
-- Independent of Faza 4 migration. Admin confirms → then team_members is populated.
CREATE TABLE team_claims (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edition_number INT NOT NULL,
  team_slug      VARCHAR(100) NOT NULL,
  status         VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'rejected'
  claimed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ,
  reviewed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, edition_number, team_slug)
);
CREATE INDEX idx_claims_team    ON team_claims(edition_number, team_slug);
CREATE INDEX idx_claims_user    ON team_claims(user_id);
CREATE INDEX idx_claims_status  ON team_claims(status);
