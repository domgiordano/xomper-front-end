import { Injectable } from '@angular/core';
import { StandingsTeam } from '../models/standings.interface';
import { League } from '../models/league.interface';
import { Roster } from '../models/roster.interface';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
    private currentTeam: StandingsTeam | null = null;

    setCurrentTeam(team: StandingsTeam): void {
        this.currentTeam = team;
    }

    getCurrentTeam(): StandingsTeam | null {
        return this.currentTeam;
    }

    getTeamName(): string {
        return this.currentTeam.teamName;
    }

    reset(): void {
        this.currentTeam = null;
    }
    getLeague(): League | null {
        return this.currentTeam.league;
    }
  
    getLeagueId(): string {
      return this.currentTeam.league.league_id;
    }

    getLeagueName(): string {
      return this.currentTeam.league.name;
    }
  
    getTeamProfilePicture(): string {
      return this.currentTeam.avatar;
    }

  
    // ---- ROSTERS ----
    getRoster(): Roster {
      return this.currentTeam.roster;
    }

}