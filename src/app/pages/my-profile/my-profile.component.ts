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
    loading = false;

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
    }

}
