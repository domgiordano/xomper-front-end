import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';

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
      private router: Router,
      private ToastService: ToastService
    ) {}

    ngOnInit(): void {
      console.log("My Profile Init.")
      this.user = this.UserService.getUser();
      this.profilePicture = `https://sleepercdn.com/avatars/${this.user.avatar}`;
      this.userName = this.user.username
      if (Object.keys(this.UserService.getLeagues()).length === 0){
        this.loading = true;
        this.getUserLeagues();
      }
    }

    getUserLeagues(): void {
      console.log('Getting User Leagues.',);
      this.UserService.getUserLeagues().pipe(take(1)).subscribe({
        next: leagues => {
          console.log("Leagues Found------", leagues);
          this.UserService.setLeagues(leagues)
          this.userLeagues = leagues;
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

}
