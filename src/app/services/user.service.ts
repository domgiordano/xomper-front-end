import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { League } from '../models/league.interface';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private myUser: UserModel | null = null;
  private currentUser: UserModel | null = null;
  private myUserLeagues: Record<string, League[]> = {};
  private currentUserLeagues: Record<string, League[]> = {};

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
  findUserLeagues(userId: string): Observable<League[]> {
    const url = `${this.baseUrl}/user/${userId}/leagues/nfl/2025`;
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
    this.myUser = new UserModel(user);
  }

  setCurrentUser(user: User): void {
    this.currentUser = new UserModel(user);
  }

  getMyUser(): UserModel | null {
    return this.myUser;
  }

  getCurrentUser(): UserModel | null {
    return this.currentUser;
  }
  buildAvatar(avatar: string): string {
    return `https://sleepercdn.com/avatars/${avatar}`
  }

}
