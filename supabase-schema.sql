-- Cricket Scoring Application - Supabase Schema (Corrected & Safe)
-- Run this in your Supabase SQL Editor

-- =====================
-- EXTENSIONS
-- =====================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- ENUM TYPES
-- =====================

CREATE TYPE match_status AS ENUM ('Upcoming', 'Live', 'Completed');
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

-- Match Table
CREATE TABLE matches (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
team_a_name TEXT NOT NULL,
team_b_name TEXT NOT NULL,
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
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_players_match ON players(match_id);
CREATE INDEX idx_innings_match ON innings(match_id);
CREATE INDEX idx_overs_innings ON overs(innings_id);
CREATE INDEX idx_balls_over ON balls(over_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE overs ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;

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

-- Innings
CREATE POLICY "Public read innings"
ON innings FOR SELECT
USING (true);

CREATE POLICY "Authenticated manage innings"
ON innings FOR ALL
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
