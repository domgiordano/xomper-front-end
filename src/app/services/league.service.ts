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
export class LeagueService {

  private currentLeagueId = "";
  private currentLeague = null;
  private baseUrl = 'https://api.sleeper.app/v1';
  constructor(
    private http: HttpClient,
    private router: Router,
    private ToastService: ToastService
    ) {}

  searchLeague(leagueId: string): Observable<any> {
    const url = `${this.baseUrl}/league/${leagueId}`;
    return this.http.get(url);
  }
  leagueSelected(): boolean {
    if (!this.currentLeague) {
      return false;
    }
    else{
      return true;
    }
  }

  reset(): void {
    this.currentLeagueId = "";
    this.currentLeague = null;
  }
  setLeague(league: any): void {
    this.currentLeague = league;
  }

  getLeague(): any {
    return this.currentLeague;
  }

}
