import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    title = 'XOMPER';
    leagueName: string | null = null;
    leagueId: string | null = null;
    username = ""
    password = ""
    loading = false;

    constructor(
      private LeagueService: LeagueService,
      private UserService: UserService,
      private AuthService: AuthService,
      private router: Router,
      private ToastService: ToastService,
      private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      console.log("Home Init.")

      this.route.paramMap.subscribe(params => {
      this.leagueName = params.get('leagueName');
      if (this.leagueName) {
        this.leagueId = this.LeagueService.getAllowedLeagueId(this.leagueName);
        if (!this.leagueId) {
          console.error('Invalid league name:', this.leagueName);
          this.router.navigate(['/home']); // fallback if invalid league
        } else {
          console.log(`Loaded league ${this.leagueName} -> ID ${this.leagueId}`);
          this.loadLeague();
        }
      }
    });
    }

    loadLeague() {
      this.loading = true;
      console.log('Loading League..:', this.leagueId);
        this.LeagueService.searchLeague(this.leagueId).pipe(take(1)).subscribe({
          next: league => {
            console.log("League Loaded------", league);
            this.LeagueService.setMyLeague(league)
            this.leagueId = this.LeagueService.getMyLeague()?.getId();
            this.leagueName = this.LeagueService.getMyLeague()?.getDisplayName();
            this.ToastService.showPositiveToast("League Loaded.")
            
          },
          error: err => {
            console.error('Error Loading League', err);
            this.ToastService.showNegativeToast('Error Loading League.');
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
    }
    login() {
      if (!this.username || !this.password) {
        this.ToastService.showNegativeToast('Please enter both username and password.');
        return;
      }
      // handle actual login here
      console.log(`Logging in ${this.username} to ${this.leagueName}`);
      this.loading = true;
      
      this.AuthService.loginUser(this.leagueId, this.username, this.password).pipe(take(1)).subscribe({
          next: user => {
            this.UserService.setMyUser(user)
            this.ToastService.showPositiveToast("User Login Success!")
            this.AuthService.toggleAuthentication();
          },
          error: err => {
            console.error('Error Logging User In', err);
            this.ToastService.showNegativeToast('Error Logging User In.');
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
            this.router.navigate(['/my-league'],
              {
                queryParams: { leagueId: this.LeagueService.getMyLeague()?.getId() }
              }
            );
          }
        });
    }

    resetPassword() {
      console.log('Reset password clicked');
    }
}
