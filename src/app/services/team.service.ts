import { Injectable } from '@angular/core';
import { StandingsTeam } from '../models/standings.interface';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { League } from '../models/league.interface';
import { Roster } from '../models/roster.interface';
import { environment } from 'src/environments/environment.prod';
import { Player } from '../models/player.interface';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
    private currentTeam: StandingsTeam | null = null;
    private xomperApiUrl: string = `https://${environment.apiId}.execute-api.us-east-1.amazonaws.com/dev`;
    private readonly apiAuthToken = environment.apiAuthToken;

    constructor(
        private http: HttpClient
    ){}

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

    getPlayerById(playerId: string): Observable<Player> {
        const url = `${this.xomperApiUrl}/player-data`;
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.apiAuthToken}`,
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('playerId', playerId);
        return this.http.get<Player>(url, {headers, params})
    }

}