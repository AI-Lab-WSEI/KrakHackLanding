-- Faza 11.2: calendar_entries — unified calendar layer.
-- Agreguje różne typy wpisów (spotkania koła, konferencje, deadline'y, milestones
-- projektów) w jedną tabelę z kategoriami i kolorystyką. Pozwala na spójny
-- filtrowalny widok kalendarza + iCal export + synchronizację z Gmail.
--
-- Nie zastępuje tabeli `events` (zeskrapowane z OpenClaw, external) — ta zostaje
-- dla konkretnych external feeds. `calendar_entries` = nasze wewnętrzne + manual
-- + agregaty (project_updates lądują tu jako category='project_milestone').

CREATE TABLE IF NOT EXISTS calendar_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  category         VARCHAR(50) NOT NULL,
  -- 'meeting'           — spotkanie koła (cotygodniowe / ad-hoc)
  -- 'conference'        — konferencja (zewnętrzna, w której uczestniczymy)
  -- 'deadline'          — termin zgłoszeń, etc.
  -- 'hackathon'         — event hackathonowy
  -- 'workshop'          — warsztat / szkolenie
  -- 'project_milestone' — auto-generowany z project_updates (linked_project_id)
  -- 'internal'          — plan wewnętrzny, nie-publiczny
  -- 'other'

  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ,
  all_day          BOOLEAN NOT NULL DEFAULT FALSE,

  location         VARCHAR(500),
  url              TEXT,

  -- Linki do obiektów w systemie (miękkie FK)
  linked_project_id  UUID REFERENCES projects(id)        ON DELETE CASCADE,
  linked_event_id    UUID REFERENCES events(id)          ON DELETE CASCADE,
  linked_update_id   UUID REFERENCES project_updates(id) ON DELETE CASCADE,

  -- Visibility + audyt
  visibility       VARCHAR(50) NOT NULL DEFAULT 'public',
  -- 'public' | 'members_only' | 'admin_only'
  color_hex        VARCHAR(16),                -- override koloru per entry (fallback: per category)

  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_entries_starts_at
  ON calendar_entries(starts_at);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_category
  ON calendar_entries(category);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_visibility_starts
  ON calendar_entries(visibility, starts_at);
