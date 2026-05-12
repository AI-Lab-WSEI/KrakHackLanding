-- 0023 — lab_interests: zdeduplikowany CRM osób zainteresowanych Kołem
--
-- Każdy kto wypełni quiz, contact form albo zapisze się do newslettera trafia
-- TUTAJ — jedna osoba = jeden wiersz. Quiz może wypełnić wielokrotnie (każda
-- próba leci do quiz_attempts), ale w lab_interests aktualizujemy
-- last_seen_at + inkrementujemy touches.
--
-- Pole `source` mówi skąd osoba weszła ('quiz' / 'newsletter' / 'contact' / ...).
-- Pole `metadata` JSONB pozwala doczepić kontekst (np. najlepszy wynik quizu).

CREATE TABLE IF NOT EXISTS lab_interests (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              VARCHAR(255) UNIQUE NOT NULL,
  display_name       VARCHAR(80),

  -- Skąd przyszli — pierwsze dotknięcie
  source             VARCHAR(32) NOT NULL,

  -- Zgody (raz na TRUE — nie cofamy automatycznie)
  consent_rodo       BOOLEAN NOT NULL DEFAULT FALSE,
  consent_newsletter BOOLEAN NOT NULL DEFAULT FALSE,

  -- Lekki kontekst: ostatni wynik quizu, ostatni poziom, etc.
  metadata           JSONB,

  -- Telemetria
  first_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  touches            INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_lab_interests_source_first
  ON lab_interests (source, first_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_lab_interests_last_seen
  ON lab_interests (last_seen_at DESC);
