import { Injectable } from '@angular/core';
import { StandingsTeamModel } from '../models/standings.model';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {
  buildStandings(standings: StandingsTeamModel[]): StandingsTeamModel[] {
    const sorted = standings.sort((a, b) => {

      if (a.getWins() !== b.getWins()) {
        return b.getWins() - a.getWins();
      }

      return b.getFpts() - a.getFpts();
    });

    // assign rank
    sorted.forEach((team, index) => {
      team.leagueRank = index + 1;
    });

    return sorted;
  }

  buildDivisionStandings(standings: StandingsTeamModel[]): Record<string, StandingsTeamModel[]> {
    const standingsByDivision: Record<string, StandingsTeamModel[]> = {};

    // group teams into divisions
    standings.forEach(team => {
      const division = team.getDivisionName() || "Unknown Division";
      if (!standingsByDivision[division]) {
        standingsByDivision[division] = [];
      }
      standingsByDivision[division].push(team);
    });

    // sort within each division & assign division ranks
    Object.values(standingsByDivision).forEach(divisionTeams => {
      divisionTeams.sort((a, b) => {
        if (a.getWins() !== b.getWins()) {
          return b.getWins() - a.getWins();
        }
        return b.getFpts() - a.getFpts();
      });

      divisionTeams.forEach((team, index) => {
        team.divisionRank = index + 1;
      });
    });

    return standingsByDivision;
  }
}
