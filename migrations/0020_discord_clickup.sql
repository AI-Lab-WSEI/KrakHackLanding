-- 0020 — integracje zewnętrzne: Discord + ClickUp
-- Cel: admin musi móc zmapować user → Discord handle (do manualnego dodawania
-- do serwera, a w przyszłości do integracji Discord bot auto-invite) oraz
-- user → email ClickUp (członkowie koła pracują w ClickUp, muszą być podani
-- z poprawnym mailem żeby otrzymać zaproszenia do workspace).
--
-- Wszystkie pola opcjonalne (NULL dopuszczalne) — forma w /dolacz strong
-- suggestion, nie required. Admin może uzupełnić za usera lub wysłać prośbę
-- o uzupełnienie (endpoint /api/admin/integrations/request-fill).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS discord_username VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discord_id       VARCHAR(64),
  ADD COLUMN IF NOT EXISTS clickup_email    VARCHAR(255);

-- Index dla lookupu discord_username przy integracji z bot'em
CREATE INDEX IF NOT EXISTS idx_users_discord_username
  ON users (LOWER(discord_username))
  WHERE discord_username IS NOT NULL;

-- Dla przyszłej integracji (Discord API zwraca stabilne snowflake ID)
CREATE INDEX IF NOT EXISTS idx_users_discord_id
  ON users (discord_id)
  WHERE discord_id IS NOT NULL;

ALTER TABLE membership_applications
  ADD COLUMN IF NOT EXISTS discord_username VARCHAR(100),
  ADD COLUMN IF NOT EXISTS clickup_email    VARCHAR(255);
