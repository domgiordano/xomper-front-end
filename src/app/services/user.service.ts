// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserId = "";
  private currentUser = null;
  private currentUserName = "";
  private baseUrl = 'https://api.sleeper.app/v1';
  private leagues = {};
  constructor(
    private http: HttpClient,
    private router: Router,
    private ToastService: ToastService
    ) {}

  searchUser(userId: string): Observable <any> {
    const url = `${this.baseUrl}/user/${userId}`;
    return this.http.get(url);
  }

  userSelected(): boolean {
    if (!this.currentUser) {
      return false;
    }
    else{
      return true;
    }
  }

  reset(): void {
    this.currentUserId = "";
    this.currentUserName = "";
    this.currentUser = null;
    this.leagues = {};
  }

  setUser(user: any): void {
    this.currentUser = user;
    this.currentUserId = this.currentUser.user_id;
    this.currentUserName = this.currentUser.username;
  }
  getUser(): any {
    return this.currentUser;
  }
  setLeagues(newLeagues: any): void {
    newLeagues.forEach(league => {
      const season = league.season;
      const id = league.league_id;
      if (!this.leagues[season]) {
        this.leagues[season] = {}; // Create object for the year if missing
      }

      this.leagues[season][id] = league;
    });
  }
  getLeagueById(leagueId: string, season: string = "2025"): any {
    return this.leagues[season][leagueId];
  }
  getLeagues(): any {
    return this.leagues;
  }
  getUserLeagues(season: String = "2025"): Observable <any> {
    const url = `${this.baseUrl}/user/${this.currentUserId}/leagues/nfl/${season}`
    return this.http.get(url);
  }

}

