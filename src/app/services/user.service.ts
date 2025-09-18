import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { League } from '../models/league.interface';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private myUser: User | null = null;
  private currentUser: User | null = null;
  private myUserLeagues: Record<string, League[]> = {};
  private currentUserLeagues: Record<string, League[]> = {};
  private xomperApiUrl: string = `https://${environment.apiId}.execute-api.us-east-1.amazonaws.com/dev`;
  private readonly apiAuthToken = environment.apiAuthToken;

  private baseUrl = 'https://api.sleeper.app/v1';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  // ---- API CALLS ----
  searchUser(userId: string): Observable<User> {
    const url = `${this.baseUrl}/user/${userId}`;
    return this.http.get<User>(url);
  }

  findMyUserLeagues(season: string = '2025'): Observable<League[]> {
    const url = `${this.baseUrl}/user/${this.myUser?.user_id}/leagues/nfl/${season}`;
    return this.http.get<League[]>(url);
  }

  findCurrentUserLeagues(season: string = '2025'): Observable<League[]> {
    const url = `${this.baseUrl}/user/${this.currentUser?.user_id}/leagues/nfl/${season}`;
    return this.http.get<League[]>(url);
  }

  // ---- USER STATE ----
  myUserSelected(): boolean {
    return !!this.myUser;
  }
  currentUserSelected(): boolean {
    return !!this.currentUser;
  }

  reset(): void {
    this.myUser = null;
    this.myUserLeagues = {};
    this.currentUser = null;
    this.currentUserLeagues = {};
  }

  setMyUser(user: User): void {
    this.myUser = user;
  }
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  getMyUser(): User | null {
    return this.myUser;
  }
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ---- LEAGUES ----
  setMyUserLeagues(newLeagues: League[]): void {
    newLeagues.forEach((league) => {
      const season = league.season;
      if (!this.myUserLeagues[season]) {
        this.myUserLeagues[season] = [];
      }
      this.myUserLeagues[season].push(league);
    });
  }

  setCurrentUserLeagues(newLeagues: League[]): void {
    newLeagues.forEach((league) => {
      const season = league.season;
      if (!this.currentUserLeagues[season]) {
        this.currentUserLeagues[season] = [];
      }
      this.currentUserLeagues[season].push(league);
    });
  }

  getMyUserLeagues(season: string = '2025'): League[] {
    return this.myUserLeagues[season] ?? [];
  }

  getCurrentUserLeagues(season: string = '2025'): League[] {
    return this.currentUserLeagues[season] ?? [];
  }

  getMyUserId(): string {
    return this.myUser?.user_id ?? '';
  }
  getCurrentUserId(): string {
    return this.currentUser?.user_id ?? '';
  }

  getMyUserName(): string {
    return this.myUser?.display_name ?? '';
  }
  getCurrentUserName(): string {
    return this.currentUser?.display_name ?? '';
  }

  getMyUserProfilePicture(): string {
    return this.myUser?.avatar
      ? `https://sleepercdn.com/avatars/${this.myUser.avatar}`
      : 'assets/img/nfl.png';
  }

  getCurrentUserProfilePicture(): string {
    return this.currentUser?.avatar
      ? `https://sleepercdn.com/avatars/${this.currentUser.avatar}`
      : 'assets/img/nfl.png';
  }
  buildAvatar(avatar: string): string {
    return `https://sleepercdn.com/avatars/${avatar}`
  }

  loginUser(leagueId: string, userId: string, passowrd: string): Observable<User> {
    const url = `${this.xomperApiUrl}/user/login`;
    const body = {
        leagueId: leagueId,
        userId: userId,
        passowrd: passowrd
    };
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.apiAuthToken}`,
        'Content-Type': 'application/json'
    });
    return this.http.post<User>(url, body, { headers });
  }
}
