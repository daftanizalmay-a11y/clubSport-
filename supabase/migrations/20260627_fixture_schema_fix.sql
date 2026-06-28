-- Align fixture_sources with application schema (safe to re-run)

ALTER TABLE fixture_sources ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE fixture_sources ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE fixture_sources ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'SE';
ALTER TABLE fixture_sources ADD COLUMN IF NOT EXISTS last_sync_status TEXT CHECK (last_sync_status IN ('success', 'error'));

UPDATE fixture_sources SET name = source_type WHERE name IS NULL;
ALTER TABLE fixture_sources ALTER COLUMN name SET NOT NULL;

-- League tables (if missing)
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

-- AI extraction columns on fixtures
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT false;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC(4,3);
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES fixture_sources(id) ON DELETE SET NULL;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Website config FKs
ALTER TABLE club_website_config ADD COLUMN IF NOT EXISTS fixture_source_id UUID REFERENCES fixture_sources(id) ON DELETE SET NULL;
ALTER TABLE club_website_config ADD COLUMN IF NOT EXISTS table_source_id UUID REFERENCES fixture_sources(id) ON DELETE SET NULL;

-- Sync logs (if missing)
CREATE TABLE IF NOT EXISTS fixture_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES fixture_sources(id) ON DELETE CASCADE,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  match_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_fixture_sync_logs_source ON fixture_sync_logs(source_id, synced_at DESC);

-- RLS
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
