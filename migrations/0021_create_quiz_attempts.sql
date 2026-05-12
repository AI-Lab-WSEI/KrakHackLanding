-- 0021 — quiz_attempts: trwałość prób quizu wiedzy o AI
-- Quiz żyje na /quiz, otwarty dla wszystkich (anonimowo). Tabela trzyma
-- każdą *ukończoną* próbę — wynik trafia tu od razu po ostatnim pytaniu,
-- ZANIM użytkownik zdecyduje czy chce raport na maila. Dzięki temu mamy
-- pełną kohortę do liczenia percentyla "lepszy niż X% graczy".
--
-- Email + answers (rozbicie per-question) zapisujemy DOPIERO gdy user
-- da zgodę RODO i poprosi o raport — wcześniej trzymamy tylko zbiorczy
-- score + breakdown wystarczający do statystyk kohortowych.

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Wybór poziomu (Łatwy / Średni / Trudny)
  level              VARCHAR(8) NOT NULL CHECK (level IN ('easy', 'mid', 'hard')),

  -- Zbiorczy wynik
  total              SMALLINT NOT NULL CHECK (total > 0 AND total <= 50),
  correct            SMALLINT NOT NULL CHECK (correct >= 0 AND correct <= total),
  percent            SMALLINT NOT NULL CHECK (percent >= 0 AND percent <= 100),

  -- Rozbicie wg trudności pytań: [{difficulty, correct, total}, ...]
  breakdown          JSONB NOT NULL,

  -- Pełne odpowiedzi per pytanie — tylko jeśli user prosił o raport
  -- (z RODO consent). Bez tego nie trzymamy fingerprintu jego decyzji.
  answers            JSONB,

  -- Email + zgody — wypełniane przy /send-results, nie /attempt
  email              VARCHAR(255),
  consent_rodo       BOOLEAN,
  consent_newsletter BOOLEAN,

  -- Telemetria czasowa
  duration_ms        INTEGER,
  emailed_at         TIMESTAMPTZ,

  -- Anti-abuse: hash IP (nie raw IP), do rate-limitu i grupowania prób
  ip_hash            VARCHAR(64),

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index dla percentyla: (level, percent) — sortuje kohortę po wyniku per poziom
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_level_percent
  ON quiz_attempts (level, percent);

-- Index dla czyszczenia / "ostatnie 30 dni"
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created
  ON quiz_attempts (created_at DESC);

-- Index dla lookupu attemptId podczas /send-results
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_id_created
  ON quiz_attempts (id, created_at);
