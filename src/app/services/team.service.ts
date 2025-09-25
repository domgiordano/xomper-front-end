import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';;
import { Player } from '../models/player.interface';
import { XomperResponse } from '../models/xomper-api-response.interface';
import { StandingsTeamModel } from '../models/standings.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
    private myTeam: StandingsTeamModel | null = null;
    private currentTeam: StandingsTeamModel | null = null;
    private xomperApiUrl: string = `https://${environment.apiId}.execute-api.us-east-1.amazonaws.com/prod`;
    private readonly apiAuthToken = environment.apiAuthToken;

    constructor(
        private http: HttpClient
    ){}

    // -------- MY TEAM --------
    setMyTeam(team: StandingsTeamModel): void {
        this.myTeam = team;
    }

    getMyTeam(): StandingsTeamModel | null {
        return this.myTeam;
    }

    
    // -------- CURRENT TEAM --------
    setCurrentTeam(team: StandingsTeamModel): void {
        this.currentTeam = team;
    }

    getCurrentTeam(): StandingsTeamModel | null {
        return this.currentTeam;
    }

    // ---- ROSTERS ----
    getPlayerById(playerId: string): Observable<Player> {
        const url = `${this.xomperApiUrl}/player/data`;
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.apiAuthToken}`,
            'Content-Type': 'application/json'
        });
        const params = new HttpParams().set('playerId', playerId);
        return this.http.get<XomperResponse<Player>>(url, {headers, params}).pipe(
          map((res: XomperResponse<Player>) => res.ResponseData)
        );
    }

    // Reset
    reset(): void {
        this.myTeam = null;
        this.currentTeam = null;
    }

}