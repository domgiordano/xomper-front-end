export interface League {
  league_id: string;
  name: string;
  season: string;
  season_type: string; // "regular" | "post" | "off"
  sport: string;       // usually "nfl"
  status: string;      // "in_season" | "pre_draft" | "complete"
  total_rosters: number;
  shard: number;
  draft_id: string;
  previous_league_id: string | null;
  bracket_id?: string | null;
  group_id?: string | null;
  avatar: string | null;   // league avatar hash
  settings: {
    daily_waivers?: number;
    daily_waiver_hour?: number;
    playoff_round_type?: number;
    playoff_teams?: number;
    playoff_seed_type?: number;
    waiver_type?: number;
    reserve_slots?: number;
    taxi_slots?: number;
    [key: string]: any;
  };
  metadata: {
    latest_league_winner_roster_id?: string;
    [key: string]: any;
  } | null;
}
