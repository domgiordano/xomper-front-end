import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Roster } from '../models/roster.interface';
import { League } from '../models/league.interface';
import { LeagueModel } from '../models/league.model';
import { User } from '../models/user.interface';
import { LeagueConfig } from '../models/league-config.interface';
import { Matchup } from '../models/matchup.interface';
import { MatchupModel } from '../models/matchup.model';
import { NflStateModel } from '../models/nfl-state.model';
import { StandingsTeamModel } from '../models/standings.model';
import { MatchupDisplay } from '../models/matchup-display.interface';

@Injectable({
  providedIn: 'root',
})
export class LeagueService {
  private myLeague: LeagueModel | null = null;
  private currentLeague: LeagueModel | null = null;
  private leagueState: NflStateModel | null = null;

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
    private http: HttpClient
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

  getLeagueMatchups(leagueId: string, week: number): Observable<{ teamA: Matchup; teamB: Matchup }[]> {
    return this.http
      .get<Matchup[]>(`${this.baseUrl}/league/${leagueId}/matchups/${week}`)
      .pipe(
        map((matchups) => {
          // Group by matchup_id
          const grouped: { [key: number]: Matchup[] } = {};
          matchups.forEach((m) => {
            if (!grouped[m.matchup_id]) {
              grouped[m.matchup_id] = [];
            }
            grouped[m.matchup_id].push(m);
          });

          // Return simple pairs of raw Matchups
          return Object.values(grouped).map((pair) => ({
            teamA: pair[0],
            teamB: pair[1]
          }));
        })
      );
  }

  getLeagueState(): Observable<NflStateModel> {
    return this.http.get<NflStateModel>(`${this.baseUrl}/state/nfl`);
  }

  // ---- LEAGUE STATE ----
  setMyLeague(league: LeagueModel): void {
    this.myLeague = league instanceof LeagueModel ? league : new LeagueModel(league);
  }

  getMyLeague(): LeagueModel | null {
    return this.myLeague;
  }

  setCurrentLeague(league: LeagueModel): void {
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

  setNflState(state: NflStateModel): void {
    this.leagueState = state;
  }
  getNflState(): NflStateModel {
   return this.leagueState;
  }

  reset(): void {
    this.myLeague = null;
    this.currentLeague = null;
    this.leagueState = null;
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
