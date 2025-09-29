export interface NflState {
  week: number;                 // Current week
  season_type: 'pre' | 'regular' | 'post'; // Season type
  season_start_date: string;    // Regular season start date (YYYY-MM-DD)
  season: string;               // Current season (year)
  previous_season: string;      // Previous season (year)
  leg: number;                  // Current leg (same as week during season)
  league_season: string;        // Active season for leagues
  league_create_season: string; // Season when new leagues are created
  display_week: number;         // Which week to display in UI
}
