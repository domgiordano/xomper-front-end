import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-search',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
    private user;
    profilePicture = "";
    userName = ""
    userLeagues = {};
    loading = false;
    // ordered fallback extensions
    private fallbackExtensions = ['jpg', 'png', 'webp'];

    constructor(
      private UserService: UserService,
      private LeagueService: LeagueService,
      private router: Router,
      private ToastService: ToastService,
      private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      console.log("My Profile Init.");
      this.user = this.UserService.getMyUser();
      this.loading = true;
      this.UserService.reset();
      // Always check query params
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        const queryUserId = params['userId'];
        console.log("UserId from query:", queryUserId);

        // Load user from query param
        this.UserService.searchUser(queryUserId).pipe(take(1)).subscribe({
          next: user => {
            console.log("User Found from query param:", user);
            this.UserService.setMyUser(user);
            this.ToastService.showPositiveToast("User Loaded.");
            this.user = user;
            this.setupUser();
          },
          error: err => {
            console.error("Error loading user from query param", err);
            this.ToastService.showNegativeToast("Error loading user.");
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      });
    }

    private setupUser(): void {
      this.profilePicture = this.UserService.getMyUserProfilePicture();
      this.userName = this.UserService.getMyUserName();
      this.userLeagues = this.UserService.getMyUserLeagues();

      if (Object.keys(this.userLeagues).length === 0) {
        this.loading = true;
        this.getUserLeagues();
      } else {
        console.log("Already have user leagues.");
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
