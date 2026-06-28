-- Add website template and theme mode to club_website_config
-- Run in Supabase SQL editor

ALTER TABLE club_website_config
  ADD COLUMN IF NOT EXISTS website_template TEXT DEFAULT 'multi-sport',
  ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'dark';

COMMENT ON COLUMN club_website_config.website_template IS 'Template slug: multi-sport, cricket, football, hockey, badminton';
COMMENT ON COLUMN club_website_config.theme_mode IS 'Theme mode: light or dark';
