import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Player } from '../models/player.interface';
import { XomperResponse } from '../models/xomper-api-response.interface';
import { StandingsTeamModel } from '../models/standings.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
    private myTeam: StandingsTeamModel | null = null;
    private currentTeam: StandingsTeamModel | null = null;

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

    // Reset
    reset(): void {
        this.myTeam = null;
        this.currentTeam = null;
    }

}