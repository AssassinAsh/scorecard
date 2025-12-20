// Database Types matching Supabase schema

export type MatchStatus = "Upcoming" | "Live" | "Completed";
export type Team = "A" | "B";
export type TeamSide = "A" | "B";
export type TossDecision = "Bat" | "Bowl";
export type ExtrasType = "Wide" | "NoBall" | "Bye" | "LegBye" | "None";
export type WicketType =
  | "Bowled"
  | "Caught"
  | "RunOut"
  | "Stumps"
  | "HitWicket"
  | "LBW"
  | "None";

export interface Tournament {
  id: string;
  name: string;
  start_date: string;
  location: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  team_a_name: string;
  team_b_name: string;
  match_date: string;
  overs_per_innings: number;
  status: MatchStatus;
  toss_winner: TeamSide | null;
  toss_decision: TossDecision | null;
  winner_team: TeamSide | null;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  match_id: string;
  team: Team;
  name: string;
  batting_order: number;
  created_at: string;
  updated_at: string;
}

export interface Innings {
  id: string;
  match_id: string;
  batting_team: Team;
  bowling_team: Team;
  total_runs: number;
  wickets: number;
  balls_bowled: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Over {
  id: string;
  innings_id: string;
  over_number: number;
  bowler_id: string | null;
  created_at: string;
}

export interface Ball {
  id: string;
  over_id: string;
  ball_number: number;
  striker_id: string;
  non_striker_id: string;
  runs_off_bat: number;
  extras_type: ExtrasType;
  extras_runs: number;
  wicket_type: WicketType;
  dismissed_player_id: string | null;
  bowler_id?: string | null; // Optional, populated from joined overs table
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
  toss_winner: TeamSide;
  toss_decision: TossDecision;
}

export interface CreateBallForm {
  over_id: string;
  ball_number: number;
  striker_id: string;
  non_striker_id: string;
  runs_off_bat: number;
  extras_type: ExtrasType;
  extras_runs: number;
  wicket_type: WicketType;
  dismissed_player_id: string | null;
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
