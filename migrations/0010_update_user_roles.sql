-- Migration 0010: Replace 'participant' role with 'hackathon-participant' and 'scienceclub-participant'
-- Additive: adds new enum values, migrates existing rows, removes old value safely
-- Rollback: migrations/0010_rollback.sql

-- Step 1: Add new enum values
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hackathon-participant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'scienceclub-participant';

-- Step 2: Migrate any existing 'participant' rows to 'hackathon-participant'
-- (safe to run even if no rows exist)
UPDATE users SET role = 'hackathon-participant' WHERE role = 'participant';

-- Note: Removing an enum value from PostgreSQL requires recreating the type.
-- We keep 'participant' in the enum for now (unused) and will clean it up
-- after verifying no data depends on it. See 0010_rollback.sql for full cleanup.
