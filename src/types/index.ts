// Database Types matching Supabase schema

// User Roles for access control
export type UserRole = "Admin" | "Manager" | "Scorer" | "Viewer";

export type MatchStatus =
  | "Upcoming"
  | "Starting Soon"
  | "Live"
  | "Innings Break"
  | "Completed";
export type MatchType = "Knock-Out" | "Quarter Final" | "Semi Final" | "Final";
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

export interface UserRoleData {
  user_id: string;
  role: UserRole;
  is_admin?: boolean; // Keep for backward compatibility during migration
  created_at: string;
}
export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  id: string;
  email: string;
  profile: UserProfile | null;
  role: UserRoleData | null;
}

export interface UpdateProfileForm {
  first_name: string;
  last_name: string;
}

// Access status for tournament_scorers table
export type AccessStatus = "pending" | "approved" | "revoked";

export interface TournamentAccess {
  tournament_id: string;
  tournament_name: string;
  granted_at: string; // Deprecated: use requested_at
  requested_at?: string;
  status?: AccessStatus;
}

// Full tournament scorer record with all fields
export interface TournamentScorer {
  id: string;
  tournament_id: string;
  user_id: string;
  status: AccessStatus;
  requested_at: string;
  approved_at: string | null;
  approved_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  notes: string | null;
  // Joined user data
  user_email?: string;
  user_name?: string;
  approver_email?: string;
}

export interface UserProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  id: string;
  email: string;
  profile: UserProfile | null;
  role: UserRoleData | null;
}

export interface UpdateProfileForm {
  first_name: string;
  last_name: string;
}

export interface TournamentAccess {
  tournament_id: string;
  tournament_name: string;
  granted_at: string;
}

export interface TeamInfo {
  id: string;
  tournament_id: string;
  name: string;
  contact_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamPlayer {
  id: string;
  team_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  team_a_id: string;
  team_b_id: string;
  team_a_name: string; // Joined field - now required with default
  team_b_name: string; // Joined field - now required with default
  team_a_contact?: string | null;
  team_b_contact?: string | null;
  match_date: string;
  overs_per_innings: number;
  match_type: MatchType | null;
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
  fielder_id: string | null;
  keeper_id: string | null;
  bowler_id?: string | null; // Optional, populated from joined overs table
  created_at: string;
}

export interface Retirement {
  id: string;
  innings_id: string;
  player_id: string;
  reason: string;
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
  team_a_id: string;
  team_b_id: string;
  match_date: string;
  overs_per_innings: number;
  match_type: MatchType;
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
  fielder_id: string | null;
  keeper_id: string | null;
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
