-- Faza 11.1: project_updates — changelog etapów projektu.
-- Każdy update to "co się zmieniło" w projekcie: nowa feature, demo, członek dołączył,
-- milestone osiągnięty itp. Renderowany jako timeline w karcie projektu (public view)
-- oraz jako wpisy w kalendarzu (event_type=project_milestone).

CREATE TABLE IF NOT EXISTS project_updates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Podstawowe pola
  title            VARCHAR(255) NOT NULL,
  body_md          TEXT,                         -- Markdown source
  update_type      VARCHAR(50) NOT NULL DEFAULT 'milestone',
  -- 'milestone' | 'feature' | 'demo' | 'team_change' | 'release' | 'other'

  -- Media
  image_url        TEXT,
  video_url        TEXT,

  -- Timeline
  happened_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published        BOOLEAN NOT NULL DEFAULT TRUE,

  -- Audyt
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_updates_project
  ON project_updates(project_id, happened_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_updates_published
  ON project_updates(published, happened_at DESC)
  WHERE published = true;
