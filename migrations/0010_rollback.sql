-- Rollback 0010: Restore 'participant' role (cannot remove enum values in-place)
-- To fully rollback: migrate rows back then recreate type without new values

UPDATE users SET role = 'participant' WHERE role IN ('hackathon-participant', 'scienceclub-participant');

-- Full enum recreation (only if needed — drops and recreates type):
-- ALTER TABLE users ALTER COLUMN role TYPE text;
-- DROP TYPE user_role;
-- CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'participant', 'jury');
-- ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
