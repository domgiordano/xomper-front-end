import { Injectable } from '@angular/core';
import { Roster } from '../models/roster.interface';
import { StandingsTeam } from '../models/standings.interface';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {
  buildStandings(standings: StandingsTeam[], groupByDivision = false): StandingsTeam[] {
    return standings.sort((a, b) => {

      if (groupByDivision && a.divisionIndex !== b.divisionIndex) {
        return a.divisionIndex - b.divisionIndex;
      }

      if (a.wins !== b.wins) {
        return b.wins - a.wins;
      }

      return b.fpts - a.fpts;
    });
  }
}
