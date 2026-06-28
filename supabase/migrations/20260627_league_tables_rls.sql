-- Base league table schema (if not already created)

CREATE TABLE IF NOT EXISTS league_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  season TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS league_table_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES league_tables(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  is_our_team BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER,
  UNIQUE (table_id, team_name)
);

CREATE INDEX IF NOT EXISTS idx_league_tables_club ON league_tables(club_id);
CREATE INDEX IF NOT EXISTS idx_league_entries_table ON league_table_entries(table_id);

-- AI extraction metadata on fixtures
ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC(4,3);

-- RLS for fixture_sources
ALTER TABLE fixture_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fixture_sources_club_access ON fixture_sources;
CREATE POLICY fixture_sources_club_access ON fixture_sources
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM club_memberships
      WHERE profile_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS fixture_sync_logs_club_access ON fixture_sync_logs;
CREATE POLICY fixture_sync_logs_club_access ON fixture_sync_logs
  FOR SELECT USING (
    source_id IN (
      SELECT id FROM fixture_sources WHERE club_id IN (
        SELECT club_id FROM club_memberships
        WHERE profile_id = auth.uid() AND status = 'active'
      )
    )
  );
