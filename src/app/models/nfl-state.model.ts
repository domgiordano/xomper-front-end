import { NflState } from "./nfl-state.interface";

export class NflStateModel {
  week: number;
  seasonType: 'pre' | 'regular' | 'post';
  seasonStartDate: string;
  season: string;
  previousSeason: string;
  leg: number;
  leagueSeason: string;
  leagueCreateSeason: string;
  displayWeek: number;

  constructor(data: NflState) {
    this.week = data.week;
    this.seasonType = data.season_type;
    this.seasonStartDate = data.season_start_date;
    this.season = data.season;
    this.previousSeason = data.previous_season;
    this.leg = data.leg;
    this.leagueSeason = data.league_season;
    this.leagueCreateSeason = data.league_create_season;
    this.displayWeek = data.display_week;
  }

  /**
   * Helper to check if NFL season is active
   */
  get isRegularSeason(): boolean {
    return this.seasonType === 'regular';
  }

  /**
   * Returns a readable label (e.g. "Week 3 - Regular Season")
   */
  get displayLabel(): string {
    return `Week ${this.displayWeek} - ${this.seasonType.toUpperCase()} Season`;
  }

}