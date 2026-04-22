-- Audit log — every write operation logged for security and debugging
CREATE TABLE audit_log (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  action       VARCHAR(255) NOT NULL,   -- 'create_project', 'update_role', etc.
  entity_type  VARCHAR(100),            -- 'project', 'user', 'certificate', etc.
  entity_id    VARCHAR(255),
  changes      JSONB,                   -- {before: {...}, after: {...}}
  ip_address   VARCHAR(45),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
