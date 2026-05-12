-- 0022 — quiz_attempts: tryb (timed/untimed) + nick na leaderboard
--
-- Nowy flow: e-mail zbieramy NA POCZĄTKU (z RODO), więc każdy wpis ma email
-- + ewentualnie display_name (opcjonalny nick do leaderboardu). Mode rozdziela
-- gry z czasem od gier bez limitu — leaderboard filtrowany per mode dla
-- uczciwego porównania.

ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS mode         VARCHAR(8) NOT NULL DEFAULT 'timed'
    CHECK (mode IN ('timed', 'untimed')),
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(40);

-- Index leaderboardowy: top N per (level, mode), sortowane po wyniku malejąco,
-- a w przypadku remisu czasem rosnąco (szybciej = wyżej, tylko dla timed).
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_leaderboard
  ON quiz_attempts (level, mode, percent DESC, duration_ms ASC NULLS LAST, created_at ASC);
