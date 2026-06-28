-- Team membership, fee reminder log, and member statistics

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  jersey_number INT,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_profile ON team_members(club_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);

CREATE TABLE IF NOT EXISTS fee_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES fee_payments(id) ON DELETE SET NULL,
  amount_remaining INT NOT NULL DEFAULT 0,
  message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fee_reminders_profile ON fee_reminders(club_id, profile_id, sent_at DESC);

CREATE TABLE IF NOT EXISTS member_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  stats JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, profile_id, sport)
);

CREATE INDEX IF NOT EXISTS idx_member_stats_profile ON member_stats(club_id, profile_id);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
