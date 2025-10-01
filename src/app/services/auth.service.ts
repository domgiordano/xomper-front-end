import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { map, Observable } from 'rxjs'
import { User } from '../models/user.interface'
import { XomperResponse } from '../models/xomper-api-response.interface'
import { environment } from 'src/environments/environment.prod'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private xomperApiUrl: string = `https://${environment.apiId}.execute-api.us-east-1.amazonaws.com/prod`
  private readonly apiAuthToken = environment.apiAuthToken
  private authenticated = false

  constructor(private http: HttpClient) {}

  loginUser(
    leagueId: string,
    userId: string,
    password: string
  ): Observable<User> {
    const url = `${this.xomperApiUrl}/user/login`
    const body = {
      leagueId: leagueId,
      userId: userId,
      password: password,
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiAuthToken}`,
      'Content-Type': 'application/json',
    })
    return this.http
      .post<XomperResponse<User>>(url, body, { headers })
      .pipe(map((res: XomperResponse<User>) => res.ResponseData))
  }

  toggleAuthentication(): void {
    this.authenticated = !this.authenticated
  }
  isLoggedIn(): boolean {
    return this.authenticated
  }
  reset(): void {
    this.authenticated = false
  }
}
