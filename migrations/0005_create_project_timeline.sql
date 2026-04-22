-- Project timeline — history of development stages with media
CREATE TABLE project_timeline (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  description  TEXT,
  -- Stage can be preset or free-form custom string
  stage        VARCHAR(100),   -- 'idea' | 'prototype' | 'mvp' | 'launch' | <custom>
  version_tag  VARCHAR(50),    -- 'v0.1', 'v1.0', etc.
  images       JSONB NOT NULL DEFAULT '[]',   -- [{url, caption, cloudinary_id}]
  links        JSONB NOT NULL DEFAULT '[]',   -- [{label, url}]
  published_at TIMESTAMPTZ,    -- historical date of this stage (can be in the past)
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_project ON project_timeline(project_id);
CREATE INDEX idx_timeline_order ON project_timeline(project_id, sort_order);
