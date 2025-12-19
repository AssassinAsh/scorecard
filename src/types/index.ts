// Database Types matching Supabase schema

export type MatchStatus = 'Upcoming' | 'Live' | 'Completed';
export type Team = 'A' | 'B';
export type TossWinner = 'team_a' | 'team_b';
export type TossDecision = 'Bat' | 'Bowl';
export type ExtrasType = 'Wide' | 'NoBall' | 'Bye' | 'LegBye' | 'None';
export type WicketType = 'Bowled' | 'Caught' | 'RunOut' | 'LBW' | 'HitWicket' | 'None';

export interface Tournament {
  id: string;
  name: string;
  start_date: string;
  location: string;
  created_by: string;
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  team_a_name: string;
  team_b_name: string;
  match_date: string;
  overs_per_innings: number;
  status: MatchStatus;
  toss_winner: TossWinner | null;
  toss_decision: TossDecision | null;
  winner_team: TossWinner | null;
  created_at: string;
}

export interface Player {
  id: string;
  match_id: string;
  team: Team;
  name: string;
  batting_order: number;
}

export interface Innings {
  id: string;
  match_id: string;
  batting_team: Team;
  bowling_team: Team;
  total_runs: number;
  wickets: number;
  overs_completed: number;
  is_completed: boolean;
  created_at: string;
}

export interface Over {
  id: string;
  innings_id: string;
  over_number: number;
  bowler_name: string;
  created_at: string;
}

export interface Ball {
  id: string;
  over_id: string;
  ball_number: number;
  striker: string;
  non_striker: string;
  bowler: string;
  runs_off_bat: number;
  extras_type: ExtrasType;
  extras_runs: number;
  wicket_type: WicketType;
  dismissed_player: string | null;
  created_at: string;
}

// Extended types with relationships
export interface MatchWithTournament extends Match {
  tournaments: Tournament;
}

export interface InningsWithBalls extends Innings {
  overs: (Over & {
    balls: Ball[];
  })[];
}

// Form types for creating new records
export interface CreateTournamentForm {
  name: string;
  start_date: string;
  location: string;
}

export interface CreateMatchForm {
  tournament_id: string;
  team_a_name: string;
  team_b_name: string;
  match_date: string;
  overs_per_innings: number;
}

export interface CreatePlayerForm {
  match_id: string;
  team: Team;
  name: string;
  batting_order: number;
}

export interface TossDetailsForm {
  toss_winner: TossWinner;
  toss_decision: TossDecision;
}

export interface CreateBallForm {
  over_id: string;
  ball_number: number;
  striker: string;
  non_striker: string;
  bowler: string;
  runs_off_bat: number;
  extras_type: ExtrasType;
  extras_runs: number;
  wicket_type: WicketType;
  dismissed_player: string | null;
}

// UI State types
export interface BallSummary {
  ballNumber: number;
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  displayText: string;
}

export interface ScoreboardData {
  match: Match;
  currentInnings: Innings;
  striker: Player;
  nonStriker: Player;
  bowler: string;
  recentBalls: BallSummary[];
  availableBatters: Player[];
  availableBowlers: Player[];
}
