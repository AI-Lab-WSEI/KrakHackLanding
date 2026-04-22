-- Additive columns on existing tables — never DROP, never NOT NULL without DEFAULT
-- These FKs are populated gradually as users activate accounts (Faza 1)
-- and during data migration scripts (Faza 4)

ALTER TABLE team_projects
  ADD COLUMN IF NOT EXISTS project_id UUID;  -- populated in Faza 4 migration script

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS user_id UUID;     -- populated when user activates account

ALTER TABLE membership_applications
  ADD COLUMN IF NOT EXISTS user_id UUID;     -- populated during onboarding flow
