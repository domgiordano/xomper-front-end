import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-search',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    private user;
    profilePicture = "";
    userName = ""
    userLeagues = {};
    loading = false;

    constructor(
      private UserService: UserService,
      private LeagueService: LeagueService,
      private router: Router,
      private ToastService: ToastService
    ) {}

    ngOnInit(): void {
      console.log("My Profile Init.")
      this.user = this.UserService.getCurrentUser();
      this.profilePicture = this.UserService.getCurrentUserProfilePicture();
      this.userName = this.UserService.getCurrentUserName();
      this.userLeagues = this.UserService.getCurrentUserLeagues();
      if (Object.keys(this.UserService.getMyUserLeagues()).length === 0){
        this.loading = true;
        this.getUserLeagues();
      }
    }

    getUserLeagues(): void {
      console.log('Getting User Leagues.');
      this.UserService.findMyUserLeagues().pipe(take(1)).subscribe({
        next: leagues => {
          console.log("Leagues Found------", leagues);
          this.UserService.setMyUserLeagues(leagues)
          this.userLeagues = this.UserService.getMyUserLeagues();
          console.log("USER LEAGUES AFTER LOADING ------------");
          console.log(this.userLeagues);
          this.ToastService.showPositiveToast("Leagues Found.")
        },
        error: err => {
          console.error('Error Getting User Leagues', err);
          this.ToastService.showNegativeToast('Error Finding Leagues.');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
    selectCurrentLeague(league: any): void {
      console.log(`League Selected: ${league.name}`);
      this.LeagueService.setCurrentLeague(league);
      this.router.navigate(['/selected-league']);
    }

}
