import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { Observable, map } from 'rxjs';
import { Roster } from '../models/roster.interface';
import { League } from '../models/league.interface';
import { LeagueModel } from '../models/league.model';
import { User } from '../models/user.interface';
import { LeagueConfig } from '../models/league-config.interface';

@Injectable({
  providedIn: 'root',
})
export class LeagueService {
  private myLeague: LeagueModel | null = null;
  private currentLeague: LeagueModel | null = null;

  private baseUrl = 'https://api.sleeper.app/v1';

  private leagueMap: Record<string, LeagueConfig> = {
    'clt-dynasty': {
      id: '1181789700187090944',
      display_name: 'CLT DYNASTY',
      dynasty: true,
      divisions: 3,
      size: 12,
      taxi: true,
    },
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  // ---- API CALLS ----
  searchLeague(leagueId: string): Observable<LeagueModel> {
    return this.http
      .get<League>(`${this.baseUrl}/league/${leagueId}`)
      .pipe(map((l) => new LeagueModel(l)));
  }

  findLeagueUsers(leagueId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/league/${leagueId}/users`);
  }

  findLeagueRosters(leagueId: string): Observable<Roster[]> {
    return this.http.get<Roster[]>(`${this.baseUrl}/league/${leagueId}/rosters`);
  }

  findUserLeagues(season: string = '2025', userId?: string): Observable<LeagueModel[]> {
    if (!userId) throw new Error("User ID required to fetch leagues");
    return this.http
      .get<League[]>(`${this.baseUrl}/user/${userId}/leagues/nfl/${season}`)
      .pipe(map((leagues) => leagues.map((l) => new LeagueModel(l))));
  }

  // ---- LEAGUE STATE ----
  setMyLeague(league: League | LeagueModel): void {
    this.myLeague = league instanceof LeagueModel ? league : new LeagueModel(league);
  }

  getMyLeague(): LeagueModel | null {
    return this.myLeague;
  }

  setCurrentLeague(league: League | LeagueModel): void {
    this.currentLeague = league instanceof LeagueModel ? league : new LeagueModel(league);
  }

  getCurrentLeague(): LeagueModel | null {
    return this.currentLeague;
  }
  myLeagueSelected(): boolean {
    return !!this.myLeague;
  }

  currentLeagueSelected(): boolean {
    return !!this.currentLeague;
  }

  reset(): void {
    this.myLeague = null;
    this.currentLeague = null;
  }

  // ---- LEAGUE MAP ----
  getAllowedLeagueId(leagueName: string): string | null {
      return this.leagueMap[leagueName]?.id ?? null;
  }

  getAllowedLeagues(): string[] {
      return Object.keys(this.leagueMap);
  }

  getLeagueMap(): Record<string, LeagueConfig> {
      return this.leagueMap;
  }

}
