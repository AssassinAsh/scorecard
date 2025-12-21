-- MIGRATION: Add Teams Table and Update Matches
-- Run this ENTIRE script in your Supabase SQL Editor

-- Step 1: Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, name)
);

-- Step 2: Add index
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);

-- Step 3: Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies (drop existing ones first if they exist)
DROP POLICY IF EXISTS "Public read teams" ON teams;
DROP POLICY IF EXISTS "Authenticated manage teams" ON teams;

CREATE POLICY "Public read teams"
ON teams FOR SELECT
USING (true);

CREATE POLICY "Authenticated manage teams"
ON teams FOR ALL
USING (auth.role() = 'authenticated');

-- Step 5: Make old columns nullable to allow new inserts
ALTER TABLE matches ALTER COLUMN team_a_name DROP NOT NULL;
ALTER TABLE matches ALTER COLUMN team_b_name DROP NOT NULL;

-- Step 6: Add new columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Step 7: Migrate existing match data to teams table (only if there are existing matches)
INSERT INTO teams (tournament_id, name)
SELECT DISTINCT tournament_id, team_a_name 
FROM matches
WHERE team_a_name IS NOT NULL AND team_a_name != ''
ON CONFLICT (tournament_id, name) DO NOTHING;

INSERT INTO teams (tournament_id, name)
SELECT DISTINCT tournament_id, team_b_name 
FROM matches
WHERE team_b_name IS NOT NULL AND team_b_name != ''
ON CONFLICT (tournament_id, name) DO NOTHING;

-- Step 8: Populate team_a_id and team_b_id for existing matches
UPDATE matches m
SET team_a_id = t.id
FROM teams t
WHERE m.tournament_id = t.tournament_id
AND m.team_a_name = t.name
AND m.team_a_id IS NULL;

UPDATE matches m
SET team_b_id = t.id
FROM teams t
WHERE m.tournament_id = t.tournament_id
AND m.team_b_name = t.name
AND m.team_b_id IS NULL;

-- Step 9: Make new columns NOT NULL
ALTER TABLE matches ALTER COLUMN team_a_id SET NOT NULL;
ALTER TABLE matches ALTER COLUMN team_b_id SET NOT NULL;

-- Verification queries:
-- Check if all matches have team IDs:
SELECT COUNT(*) as total_matches,
       COUNT(team_a_id) as with_team_a,
       COUNT(team_b_id) as with_team_b
FROM matches;

-- See teams created:
SELECT t.name, count(m.id) as match_count
FROM teams t
LEFT JOIN matches m ON m.team_a_id = t.id OR m.team_b_id = t.id
GROUP BY t.id, t.name
ORDER BY t.name;
