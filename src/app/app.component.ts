// Main file - Angular Spotify
import { Component, OnDestroy
 } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'XOMIFY';

  constructor(
    private AuthService: AuthService
  ) {}
  ngOnDestroy(): void {
    this.AuthService.logout();
  }
}
