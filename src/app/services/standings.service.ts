import { Injectable } from '@angular/core';
import { Roster } from '../models/roster.interface';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {
  buildStandings(rosters: Roster[]): Roster[] {
    return rosters.sort((a, b) => {
      if (a.settings.division !== b.settings.division) {
        return a.settings.division - b.settings.division;
      }

      if (a.settings.wins !== b.settings.wins) {
        return b.settings.wins - a.settings.wins;
      }

      const aPoints = a.settings.fpts + (a.settings.fpts_decimal ?? 0) / 100;
      const bPoints = b.settings.fpts + (b.settings.fpts_decimal ?? 0) / 100;

      return bPoints - aPoints;
    });
  }
}
