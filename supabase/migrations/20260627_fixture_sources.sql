-- Fixture sources & sync logs for dual-source fixture system

CREATE TABLE IF NOT EXISTS fixture_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  sport_type TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('image', 'webhook', 'football_api', 'hockey_api', 'cricket', 'badminton')),
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  sync_frequency TEXT NOT NULL DEFAULT 'manual' CHECK (sync_frequency IN ('hourly', 'daily', 'manual')),
  api_key_encrypted TEXT,
  webhook_secret_encrypted TEXT,
  config JSONB DEFAULT '{}',
  country_code TEXT NOT NULL DEFAULT 'SE',
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, source_type)
);

CREATE TABLE IF NOT EXISTS fixture_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES fixture_sources(id) ON DELETE CASCADE,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  match_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_fixture_sources_club ON fixture_sources(club_id);
CREATE INDEX IF NOT EXISTS idx_fixture_sources_enabled ON fixture_sources(is_enabled, sync_frequency) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_fixture_sync_logs_source ON fixture_sync_logs(source_id, synced_at DESC);

-- Extend fixtures for source tracking
ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES fixture_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE INDEX IF NOT EXISTS idx_fixtures_external ON fixtures(club_id, external_id) WHERE external_id IS NOT NULL;

-- Extend club_website_config
ALTER TABLE club_website_config
  ADD COLUMN IF NOT EXISTS fixture_source_id UUID REFERENCES fixture_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS table_source_id UUID REFERENCES fixture_sources(id) ON DELETE SET NULL;

-- Seed default sources for existing clubs (optional, run manually if needed)
-- INSERT INTO fixture_sources (club_id, sport_type, source_type, name, description)
-- SELECT c.id, c.sport, 'image', 'Bilduppladdning', 'Ladda upp matchbild för AI-extrahering'
-- FROM clubs c ON CONFLICT DO NOTHING;
