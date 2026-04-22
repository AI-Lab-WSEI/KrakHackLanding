-- Events calendar — competitions, conferences, workshops
CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  event_type       VARCHAR(100),
  -- 'hackathon' | 'conference' | 'competition' | 'workshop' | 'deadline' | 'other'
  source           VARCHAR(50) NOT NULL DEFAULT 'manual',
  -- 'manual' | 'bot_openclaw' | 'imported'

  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ,
  deadline_at      TIMESTAMPTZ,   -- submission/registration deadline

  location         VARCHAR(500),
  url              TEXT,
  organizer        VARCHAR(255),

  visibility       VARCHAR(50) NOT NULL DEFAULT 'admin_only',
  -- 'admin_only' | 'members_only' | 'public'
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  relevance_score  INT,            -- 1-10, set by bot
  reminder_days    INT[] NOT NULL DEFAULT '{}',  -- [30, 14, 7, 1]

  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  source_data      JSONB,          -- raw payload from bot
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_visibility ON events(visibility);
CREATE INDEX idx_events_source ON events(source);

CREATE TABLE event_reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  send_at     TIMESTAMPTZ NOT NULL,
  sent_at     TIMESTAMPTZ,
  recipients  JSONB NOT NULL DEFAULT '[]',  -- ['all_admins'] or list of emails
  status      VARCHAR(50) NOT NULL DEFAULT 'pending'
  -- 'pending' | 'sent' | 'failed'
);

CREATE INDEX idx_event_reminders_send_at ON event_reminders(send_at)
  WHERE status = 'pending';
