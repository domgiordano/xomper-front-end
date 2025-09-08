import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    title = 'XOMPER';
    leagueId = "";
    userId = "";
    loading = false;

    constructor(
      private LeagueService: LeagueService,
      private UserService: UserService,
      private router: Router,
      private ToastService: ToastService
    ) {}

    ngOnInit(): void {
      console.log("Search Init.")
    }

    onLeagueInput() {
      if (this.leagueId.length > 0) {
        this.userId = ''; // clear userId if league is being typed
      }
    }

    onUserInput() {
      if (this.userId.length > 0) {
        this.leagueId = ''; // clear leagueId if user is being typed
      }
    }

    search() {
      this.loading = true;
      this.LeagueService.reset();
      this.UserService.reset();
      if (this.leagueId) {
        console.log('Searching by League ID:', this.leagueId);
        this.LeagueService.searchLeague(this.leagueId).pipe(take(1)).subscribe({
          next: league => {
            console.log("League Found------", league);
            this.LeagueService.setLeague(league)
            this.ToastService.showPositiveToast("League Found.")
            
          },
          error: err => {
            console.error('Error Searching League', err);
            this.ToastService.showNegativeToast('Error Finding League.');
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
            this.router.navigate(['/my-league']);
          }
        });
      } else if (this.userId) {
        console.log('Searching by User ID:', this.userId);
        this.UserService.searchUser(this.userId).pipe(take(1)).subscribe({
          next: user => {
            console.log("User Found------", user);
            this.UserService.setUser(user)
            this.ToastService.showPositiveToast("User Found.")
          },
          error: err => {
            console.error('Error Searching User', err);
            this.ToastService.showNegativeToast('Error Finding User.');
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
            this.router.navigate(['/my-profile']);
          }
        });
      } else {
        console.log('No input provided');
        this.ToastService.showNegativeToast('No input provided.');
        this.loading = false;
      }
    }
}
