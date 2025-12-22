-- =====================================================
-- Cricket Scoring Application - Complete Database Schema
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Copy and paste this ENTIRE file
-- 4. Click 'Run' to create all tables, functions, and policies
--
-- This creates:
-- - Core database structure (tournaments, teams, matches, players, etc.)
-- - Admin role system (user_roles table)
-- - Tournament access control (tournament_scorers table)
-- - Row Level Security (RLS) policies
-- - Helper functions for access checks
--
-- After running, create your admin account:
-- INSERT INTO user_roles (user_id, is_admin) VALUES ('your-user-id', true);
-- =====================================================

-- =====================
-- EXTENSIONS
-- =====================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- ENUM TYPES
-- =====================

CREATE TYPE match_status AS ENUM (
	'Upcoming',
	'Starting Soon',
	'Live',
	'Innings Break',
	'Completed'
);
CREATE TYPE toss_decision_type AS ENUM ('Bat', 'Bowl');
CREATE TYPE team_side AS ENUM ('A', 'B');
CREATE TYPE extras_type AS ENUM ('Wide', 'NoBall', 'Bye', 'LegBye', 'None');
CREATE TYPE wicket_type AS ENUM ('Bowled', 'Caught', 'RunOut', 'Stumps', 'HitWicket', 'LBW', 'None');

-- =====================
-- TABLES
-- =====================

-- Tournament Table
CREATE TABLE tournaments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
start_date DATE NOT NULL,
location TEXT NOT NULL,
created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Table
CREATE TABLE teams (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
name TEXT NOT NULL,
contact_number TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(tournament_id, name)
);

-- Match Table
CREATE TABLE matches (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
match_date DATE NOT NULL,
overs_per_innings INTEGER NOT NULL DEFAULT 20 CHECK (overs_per_innings > 0),
status match_status NOT NULL DEFAULT 'Upcoming',
toss_winner team_side,
toss_decision toss_decision_type,
winner_team team_side,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player Table
CREATE TABLE players (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
team team_side NOT NULL,
name TEXT NOT NULL,
batting_order INTEGER NOT NULL CHECK (batting_order BETWEEN 1 AND 11),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persistent team roster (reusable players per team)
CREATE TABLE team_players (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
name TEXT NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(team_id, name)
);

-- Innings Table
CREATE TABLE innings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
batting_team team_side NOT NULL,
bowling_team team_side NOT NULL,
total_runs INTEGER NOT NULL DEFAULT 0,
wickets INTEGER NOT NULL DEFAULT 0 CHECK (wickets BETWEEN 0 AND 10),
balls_bowled INTEGER NOT NULL DEFAULT 0,
is_completed BOOLEAN NOT NULL DEFAULT FALSE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retirement events (per player per innings)
CREATE TABLE retirements (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
innings_id UUID REFERENCES innings(id) ON DELETE CASCADE NOT NULL,
player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
reason TEXT NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Over Table
CREATE TABLE overs (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
innings_id UUID REFERENCES innings(id) ON DELETE CASCADE NOT NULL,
over_number INTEGER NOT NULL CHECK (over_number >= 1),
bowler_id UUID REFERENCES players(id),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ball Table
CREATE TABLE balls (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
over_id UUID REFERENCES overs(id) ON DELETE CASCADE NOT NULL,
ball_number INTEGER NOT NULL CHECK (ball_number BETWEEN 0 AND 6),
striker_id UUID REFERENCES players(id) NOT NULL,
non_striker_id UUID REFERENCES players(id) NOT NULL,
runs_off_bat INTEGER NOT NULL DEFAULT 0 CHECK (runs_off_bat BETWEEN 0 AND 6),
extras_type extras_type NOT NULL DEFAULT 'None',
extras_runs INTEGER NOT NULL DEFAULT 0 CHECK (extras_runs BETWEEN 0 AND 6),
wicket_type wicket_type NOT NULL DEFAULT 'None',
dismissed_player_id UUID REFERENCES players(id),
fielder_id UUID REFERENCES players(id),
keeper_id UUID REFERENCES players(id),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_players_match ON players(match_id);
CREATE INDEX idx_team_players_team ON team_players(team_id);
CREATE INDEX idx_innings_match ON innings(match_id);
CREATE INDEX idx_innings_match_completed ON innings(match_id, is_completed);
CREATE INDEX idx_overs_innings ON overs(innings_id);
CREATE INDEX idx_balls_over ON balls(over_id);
CREATE INDEX idx_balls_over_extras ON balls(over_id, extras_type);
CREATE INDEX idx_balls_created ON balls(created_at DESC);
CREATE INDEX idx_retirements_innings ON retirements(innings_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE overs ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE retirements ENABLE ROW LEVEL SECURITY;

-- Tournaments
CREATE POLICY "Public read tournaments"
ON tournaments FOR SELECT
USING (true);

CREATE POLICY "Authenticated create tournaments"
ON tournaments FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owner update tournaments"
ON tournaments FOR UPDATE
USING (auth.uid() = created_by);

-- Teams
CREATE POLICY "Public read teams"
ON teams FOR SELECT
USING (true);

CREATE POLICY "Authenticated manage teams"
ON teams FOR ALL
USING (auth.role() = 'authenticated');

-- Matches
CREATE POLICY "Public read matches"
ON matches FOR SELECT
USING (true);

CREATE POLICY "Authenticated create matches"
ON matches FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update matches"
ON matches FOR UPDATE
USING (auth.role() = 'authenticated');

-- Players
CREATE POLICY "Public read players"
ON players FOR SELECT
USING (true);

CREATE POLICY "Authenticated manage players"
ON players FOR ALL
USING (auth.role() = 'authenticated');

-- Team players (persistent team rosters)
CREATE POLICY "Public read team players"
ON team_players FOR SELECT
USING (true);

CREATE POLICY "Authenticated manage team players"
ON team_players FOR ALL
USING (auth.role() = 'authenticated');

-- Innings
CREATE POLICY "Public read innings"
ON innings FOR SELECT
USING (true);

CREATE POLICY "Authenticated manage innings"
ON innings FOR ALL
USING (auth.role() = 'authenticated');

-- Retirements
CREATE POLICY "Public read retirements"
ON retirements FOR SELECT
USING (true);

CREATE POLICY "Authenticated manage retirements"
ON retirements FOR ALL
USING (auth.role() = 'authenticated');

-- Overs
CREATE POLICY "Public read overs"
ON overs FOR SELECT
USING (true);

CREATE POLICY "Authenticated insert overs"
ON overs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Balls
CREATE POLICY "Public read balls"
ON balls FOR SELECT
USING (true);

CREATE POLICY "Authenticated insert balls"
ON balls FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated scorers to delete balls (for undo last delivery)
CREATE POLICY "Authenticated delete balls"
ON balls FOR DELETE
USING (auth.role() = 'authenticated');

-- =====================
-- TRIGGERS
-- =====================

CREATE OR REPLACE FUNCTION update_match_status()
RETURNS TRIGGER AS $$
BEGIN
UPDATE matches
SET status = 'Live', updated_at = NOW()
WHERE id = NEW.match_id AND status = 'Upcoming';

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_status
AFTER INSERT ON innings
FOR EACH ROW
EXECUTE FUNCTION update_match_status();

-- =====================================================
-- ACCESS CONTROL SYSTEM
-- =====================================================

-- User Roles Table (Admin system)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_roles_admin ON user_roles(is_admin) WHERE is_admin = true;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Tournament Scorers Table (Access control)
CREATE TABLE IF NOT EXISTS tournament_scorers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

CREATE INDEX idx_tournament_scorers_tournament ON tournament_scorers(tournament_id);
CREATE INDEX idx_tournament_scorers_user ON tournament_scorers(user_id);

ALTER TABLE tournament_scorers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament_scorers"
  ON tournament_scorers FOR SELECT
  TO authenticated
  USING (true);

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user has scorer access to a tournament
CREATE OR REPLACE FUNCTION has_scorer_access(tournament_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM tournament_scorers 
    WHERE tournament_id = tournament_uuid 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SETUP INSTRUCTIONS
-- =====================================================
-- 
-- After running this schema, create your admin account:
-- 
-- 1. Create a user in Authentication > Users
-- 2. Run this SQL with your user ID:
--    INSERT INTO user_roles (user_id, is_admin) 
--    VALUES ('your-user-id-here', true);
--
-- To grant scorer access to tournaments:
--    INSERT INTO tournament_scorers (tournament_id, user_id) 
--    VALUES ('tournament-id', 'scorer-user-id');
-- =====================================================
