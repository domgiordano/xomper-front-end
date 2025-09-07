// song.service.ts
import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, expand, takeWhile } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ArtistService implements OnInit {
  accessToken: string;
  artists = [];
  topArtistsShortTerm = [];
  topArtistsMedTerm = [];
  topArtistsLongTerm = [];
  private baseUrl = 'https://api.spotify.com/v1';

  constructor(
      private http: HttpClient,
      private AuthService: AuthService
    ) {}
  ngOnInit() {
    this.accessToken = this.AuthService.getAccessToken();
  }

  getArtistsByIds(ids: string): Observable<any>{
    this.accessToken = this.AuthService.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });
    return this.http.get(`${this.baseUrl}/artists?ids=${ids}`, { headers });
  }

  getTopArtists(term: string): Observable<any> {
    this.accessToken = this.AuthService.getAccessToken();
    return this.http.get(`${this.baseUrl}/me/top/artists?limit=50&time_range=${term}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      }
    })
  }

  getArtistDetails(artistId: string): Observable<any> {
    this.accessToken = this.AuthService.getAccessToken();
    return this.http.get(`${this.baseUrl}/artists/${artistId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      }
    })
  }

  getArtistAlbums(artistId: string): Observable<any> {
    this.accessToken = this.AuthService.getAccessToken();
    return this.http.get(`${this.baseUrl}/artists/${artistId}/albums`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      }
    })
  }

  getArtistTopTracks(artistId: string): Observable<any> {
    this.accessToken = this.AuthService.getAccessToken();
    return this.http.get(`${this.baseUrl}/artists/${artistId}/top-tracks`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      }
    })
  }

  getArtistRelatedArtists(artistId: string): Observable<any> {
    this.accessToken = this.AuthService.getAccessToken();
    return this.http.get(`${this.baseUrl}/artists/${artistId}/related-artists`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      }
    })
  }

  getAllTermsTopArtistsIds(): any {
    return {
      short_term: this.topArtistsShortTerm.map(item => item.id),
      medium_term: this.topArtistsMedTerm.map(item => item.id),
      long_term: this.topArtistsLongTerm.map(item => item.id),
    }
  }
  getShortTermTopArtists(): any[] {
    return this.topArtistsShortTerm;
  }
  getMedTermTopArtists(): any[] {
    return this.topArtistsMedTerm;
  }
  getLongTermTopArtists(): any[] {
    return this.topArtistsLongTerm;
  }
  setShortTermTopArtists(Artists: any[]): void {
    this.topArtistsShortTerm = Artists;
  }
  setMedTermTopArtists(Artists: any[]): void {
    this.topArtistsMedTerm = Artists;
  }
  setLongTermTopArtists(Artists: any[]): void {
    this.topArtistsLongTerm = Artists;
  }

  getArtists(): any[] {
    return this.artists;
  }

}
