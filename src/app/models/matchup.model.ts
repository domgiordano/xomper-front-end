// src/app/models/matchup.model.ts
import { Matchup } from './matchup.interface';
import { StandingsTeamModel } from './standings.model';

export class MatchupModel {
  rosterId: number;
  matchupId: number;
  points: number;
  starters: string[];
  players: string[];

  // Enriched from StandingsTeamModel
  teamName: string;
  avatar: string | null;
  record: string;
  userName: string;

  constructor(data: Matchup, team?: StandingsTeamModel) {
    this.rosterId = data.roster_id;
    this.matchupId = data.matchup_id;
    this.points = data.points ?? 0;
    this.starters = data.starters ?? [];
    this.players = data.players ?? [];

    if (team) {
      this.teamName = team.getTeamName();
      this.avatar = team.getProfilePicture();
      this.record = team.getRecord();
      this.userName = team.getUserName();
    } else {
      this.teamName = '';
      this.avatar = null;
      this.record = '';
      this.userName = '';
    }
  }
}
