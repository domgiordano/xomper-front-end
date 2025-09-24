import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';
import { UserModel } from 'src/app/models/user.model';
import { LeagueModel } from 'src/app/models/league.model';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
    private user: UserModel;
    profilePicture = "";
    userName = ""
    userLeagues: LeagueModel[] = [];
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
            this.user = this.UserService.getMyUser();
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
      this.profilePicture = this.user.getProfilePicture();;
      this.userName = this.user.getUserName();
      this.userLeagues = this.user.getUserLeagues();

      if (Object.keys(this.userLeagues).length === 0) {
        this.loading = true;
        this.getUserLeagues();
      } else {
        console.log("Already have user leagues.");
      }
    }

    getUserLeagues(): void {
      console.log('Getting User Leagues.');
      this.UserService.findUserLeagues(this.UserService.getMyUser()?.getUserId()).pipe(take(1)).subscribe({
        next: leagues => {
          console.log("Leagues Found------", leagues);
          // Convert each raw User to a UserModel
          const leagueModels = leagues.map(league => new LeagueModel(league));

          this.user.setUserLeagues(leagueModels)
          this.userLeagues = this.user.getUserLeagues();
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
    selectCurrentLeague(league: LeagueModel): void {
      const leagueId = league.getId();
      const leagueName = league.getDisplayName();
      console.log(`League Selected: ${leagueName}`)
      if (leagueId == this.LeagueService.getMyLeague()?.getId()){
        console.log("Selected your own league - (conceited, pompous, self centered)")
        this.router.navigate(['/my-league'],
          {
            queryParams: { 
              leagueId: leagueId
            }
          }
        );
      }
      else {
        this.router.navigate(['/selected-league'],
          {
            queryParams: { 
              leagueId: leagueId
            }
          }
        );
      }
    }

}
