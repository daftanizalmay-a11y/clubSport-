-- Dynamic dropdown options per club

CREATE TABLE IF NOT EXISTS dropdown_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  dropdown_type TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, dropdown_type, value)
);

CREATE INDEX IF NOT EXISTS idx_dropdown_options_club_type ON dropdown_options(club_id, dropdown_type, is_active);

-- Seed defaults for Ariana CC
INSERT INTO dropdown_options (club_id, dropdown_type, label, value, sort_order) VALUES
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'gender', 'Män', 'male', 0),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'gender', 'Kvinnor', 'female', 1),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'gender', 'Andra', 'other', 2),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'gender', 'Blandat', 'mixed', 3),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'gender', 'Herr', 'men', 4),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'gender', 'Dam', 'women', 5),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'age_group', 'Senior', 'senior', 0),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'age_group', 'Junior', 'junior', 1),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'age_group', 'Youth', 'youth', 2),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'age_group', 'U17', 'u17', 3),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'age_group', 'U15', 'u15', 4),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'season', '2025', '2025', 0),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'season', '2026', '2026', 1),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'season', '2027', '2027', 2),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Cricket', 'cricket', 0),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Fotboll', 'football', 1),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Basket', 'basketball', 2),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Hockey', 'hockey', 3),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Badminton', 'badminton', 4),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Tennis', 'tennis', 5),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Volleyboll', 'volleyball', 6),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'sport', 'Annan', 'other', 7),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'competition', 'Allsvenskan', 'allsvenskan', 0),
('d7fda39e-9f44-447c-8aa8-71fe4cba6227', 'competition', 'Superettan', 'superettan', 1)
ON CONFLICT (club_id, dropdown_type, value) DO NOTHING;
