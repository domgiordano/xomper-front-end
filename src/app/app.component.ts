// Main file - Angular Spotify
import { Component, OnDestroy } from '@angular/core';
import { LeagueService } from './services/league.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'XOMPER';

  constructor(
    private AuthService: AuthService,
    private LeagueService: LeagueService,
    private UserService: UserService
  ) {}
  ngOnDestroy(): void {
    this.AuthService.reset();
    this.LeagueService.reset();
    this.UserService.reset();
  }
}
