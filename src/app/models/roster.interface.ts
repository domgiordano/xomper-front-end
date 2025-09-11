export interface Roster {
  co_owners: string[] | null; // list of co-owner IDs (null if none)
  keepers: string[] | null;   // list of keeper player IDs (null if none)
  league_id: string;          // the league this roster belongs to
  metadata: {
    allow_pn_inactive_starters?: string;
    allow_pn_player_injury_status?: string;
    allow_pn_scoring?: string;
    record?: string; // W, L, or T
    restrict_pn_scoring_starters_only?: string;
    [key: string]: any; // catch any other sleeper metadata fields
  } | null;
  owner_id: string | null;    // user ID of roster owner
  player_map: Record<string, any> | null; // mapping player_id -> ?
  players: string[] | null;   // all player IDs on roster
  reserve: string[] | null;   // injured/reserve players
  roster_id: number;          // roster slot number (unique within league)
  settings: {
    wins: number;
    losses: number;
    ties: number;
    division: number;
    fpts: number;             // fantasy points (integer part)
    fpts_decimal: number;     // decimal part
    fpts_against: number;
    fpts_against_decimal: number;
    waiver_position?: number;
    waiver_budget_used?: number;
    total_moves?: number;
    [key: string]: any;       // allow unknown Sleeper fields
  };
  starters: string[] | null;  // starting lineup player IDs
  taxi: string[] | null;      // taxi squad player IDs
}