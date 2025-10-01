import { StandingsTeamModel } from "./standings.model";

export interface MatchupDisplay {
  teamA: {
    teamName: string;
    avatar: string;
    wins: number;
    losses: number;
    points: number;
    standingsTeam: StandingsTeamModel;
  };
  teamB: {
    teamName: string;
    avatar: string;
    wins: number;
    losses: number;
    points: number;
    standingsTeam: StandingsTeamModel;
  };
  status: string;
}