import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';
import { Roster } from '../models/roster.interface';
import { League } from '../models/league.interface';
import { User } from '../models/user.interface';
import { LeagueConfig } from '../models/league-config.interface';

@Injectable({
  providedIn: 'root',
})
export class LeagueService {
  private myLeague: League | null = null;
  private currentLeague: League | null = null;
  private myLeagueUsers: User[] = [];
  private currentLeagueUsers: User[] = [];
  private myLeagueRosters: Roster[] = [];
  private currentLeagueRosters: Roster[] = [];

  private baseUrl = 'https://api.sleeper.app/v1';

  private leagueMap: Record<string, LeagueConfig> = {
    'clt-dynasty': {
      id: '1181789700187090944',
      display_name: 'CLT DYNASTY',
      dynasty: true,
      divisions: 3,
      size: 12,
      taxi: true
    }
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  // ---- API CALLS ----
  searchLeague(leagueId: string): Observable<League> {
    const url = `${this.baseUrl}/league/${leagueId}`;
    return this.http.get<League>(url);
  }

  getLeagueUsers(leagueId: string): Observable<User[]> {
    const url = `${this.baseUrl}/league/${leagueId}/users`;
    return this.http.get<User[]>(url);
  }

  getLeagueRosters(leagueId: string): Observable<Roster[]> {
    const url = `${this.baseUrl}/league/${leagueId}/rosters`;
    return this.http.get<Roster[]>(url);
  }

  // ---- LEAGUE STATE ----
  myLeagueSelected(): boolean {
    return !!this.myLeague;
  }

  currentLeagueSelected(): boolean {
    return !!this.currentLeague;
  }

  reset(): void {
    this.myLeague = null;
    this.currentLeague = null;
    this.myLeagueUsers = [];
    this.currentLeagueUsers = [];
  }

  setMyLeague(league: League): void {
    this.myLeague = league;
  }
  setCurrentLeague(league: League): void {
    this.currentLeague = league;
  }

  getMyLeague(): League | null {
    return this.myLeague;
  }
  getCurrentLeague(): League | null {
    return this.currentLeague;
  }

  getMyLeagueId(): string {
    return this.myLeague?.league_id ?? '';
  }
  getCurrentLeagueId(): string {
    return this.currentLeague?.league_id ?? '';
  }

  getMyLeagueName(): string {
    return this.myLeague?.name ?? '';
  }
  getCurrentLeagueName(): string {
    return this.currentLeague?.name ?? '';
  }

  getMyLeagueProfilePicture(): string {
    return this.myLeague?.avatar
      ? `https://sleepercdn.com/avatars/${this.myLeague.avatar}`
      : 'assets/img/nfl.png';
  }
  getCurrentLeagueProfilePicture(): string {
    return this.currentLeague?.avatar
      ? `https://sleepercdn.com/avatars/${this.currentLeague.avatar}`
      : 'assets/img/nfl.png';
  }

  // ---- USERS ----
  setMyLeagueUsers(users: User[]): void {
    this.myLeagueUsers = users;
  }
  getMyLeagueUsers(): User[] {
    return this.myLeagueUsers;
  }

  setCurrentLeagueUsers(users: User[]): void {
    this.currentLeagueUsers = users;
  }
  getCurrentLeagueUsers(): User[] {
    return this.currentLeagueUsers;
  }

  // ---- ROSTERS ----
  getMyLeagueRosters(): Roster[] {
    return this.myLeagueRosters;
  }
  setMyLeagueRosters(rosters: Roster[]): void {
    this.myLeagueRosters = rosters;
  }

  getCurrentLeagueRosters(): Roster[] {
    return this.currentLeagueRosters;
  }
  setCurrentLeagueRosters(rosters: Roster[]): void {
    this.currentLeagueRosters = rosters;
  }
  buildAvatar(avatar: string): string {
    return `https://sleepercdn.com/avatars/${avatar}`
  }

  getAllowedLeagueId(leagueName: string): string | null {
    return this.leagueMap[leagueName].id || null;
  }
  getAllowedLeagues(): string[] {
    return Object.keys(this.leagueMap);
  }
  getLeagueMap(): Record<string, LeagueConfig> {
    return this.leagueMap;
  }
}
