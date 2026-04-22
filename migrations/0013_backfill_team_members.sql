-- Faza 9: Backfill team_members from confirmed team_claims
-- Idempotent — safe to re-run. Picks up any confirmed claim whose (team_slug, edition)
-- now has a teams row but wasn't linked into team_members yet (e.g. claim was
-- confirmed before Faza 4 migration created the teams row).

INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT t.id, tc.user_id, 'member', COALESCE(tc.reviewed_at, NOW())
FROM team_claims tc
JOIN teams t
  ON t.slug = tc.team_slug
 AND t.edition_number = tc.edition_number
WHERE tc.status = 'confirmed'
ON CONFLICT (team_id, user_id) DO NOTHING;
