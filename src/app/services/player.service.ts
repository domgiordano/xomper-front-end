import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment.dev';
import { Player } from '../models/player.interface';
import { PlayerModel } from '../models/player.model';
import { XomperResponse } from '../models/xomper-api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private currentPlayer: PlayerModel | null = null;

  private readonly xomperApiUrl = `https://${environment.apiId}.execute-api.us-east-1.amazonaws.com/prod`;
  private readonly apiAuthToken = environment.apiAuthToken;

  constructor(private http: HttpClient) {}

  // -------- CURRENT PLAYER CACHE --------
  setCurrentPlayer(player: Player): void {
    this.currentPlayer = new PlayerModel(player);
  }

  getCurrentPlayer(): PlayerModel | null {
    return this.currentPlayer;
  }

  reset(): void {
    this.currentPlayer = null;
  }

  // -------- API CALLS --------
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

  searchPlayers(query: string): Observable<PlayerModel[]> {
    const url = `${this.xomperApiUrl}/player/search`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiAuthToken}`,
      'Content-Type': 'application/json',
    });
    const params = new HttpParams().set('q', query);

    return this.http
      .get<XomperResponse<Player[]>>(url, { headers, params })
      .pipe(
        map((res) =>
          res.ResponseData.map((player: Player) => new PlayerModel(player))
        )
      );
  }
}
