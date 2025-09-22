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
    private myTeam: StandingsTeam | null = null;
    private currentTeam: StandingsTeam | null = null;
    private xomperApiUrl: string = `https://${environment.apiId}.execute-api.us-east-1.amazonaws.com/prod`;
    private readonly apiAuthToken = environment.apiAuthToken;

    constructor(
        private http: HttpClient
    ){}

    // -------- MY TEAM --------
    setMyTeam(team: StandingsTeam): void {
        this.myTeam = team;
    }

    getMyTeam(): StandingsTeam | null {
        return this.myTeam;
    }

    getMyTeamName(): string {
        return this.myTeam.teamName;
    }

    
    getMyTeamLeague(): League | null {
        return this.myTeam.league;
    }
  
    getMyTeamLeagueId(): string {
      return this.myTeam.league.league_id;
    }

    getMyTeamLeagueName(): string {
      return this.myTeam.league.name;
    }
  
    getMyTeamProfilePicture(): string {
      return this.myTeam.avatar;
    }
    getMyTeamUserName(): string {
      return this.myTeam.userName;
    }
    
    // -------- CURRENT TEAM --------
    setCurrentTeam(team: StandingsTeam): void {
        this.currentTeam = team;
    }

    getCurrentTeam(): StandingsTeam | null {
        return this.currentTeam;
    }

    getCurrentTeamName(): string {
        return this.currentTeam.teamName;
    }

    getCurrentTeamLeague(): League | null {
        return this.currentTeam.league;
    }
  
    getCurrentTeamLeagueId(): string {
      return this.currentTeam.league.league_id;
    }

    getCurrentTeamLeagueName(): string {
      return this.currentTeam.league.name;
    }
  
    getCurrentTeamProfilePicture(): string {
      return this.currentTeam.avatar;
    }
    getCurrentTeamUserName(): string {
      return this.currentTeam.userName;
    }

  
    // ---- ROSTERS ----
    getMyTeamRoster(): Roster {
      return this.myTeam.roster;
    }

    getMyTeamPlayers(): Player[] {
      return this.myTeam.players;
    }

    getCurrentTeamRoster(): Roster {
      return this.currentTeam.roster;
    }

    getCurrentTeamPlayers(): Player[] {
      return this.currentTeam.players;
    }

    getPlayerById(playerId: string): Observable<Player> {
        const url = `${this.xomperApiUrl}/player/datar`;
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.apiAuthToken}`,
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('playerId', playerId);
        return this.http.get<Player>(url, {headers, params})
    }

    // Reset
    reset(): void {
        this.myTeam = null;
        this.currentTeam = null;
    }

}