import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { LeagueService } from 'src/app/services/league.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-search',
  templateUrl: './my-league.component.html',
  styleUrls: ['./my-league.component.scss']
})
export class MyLeagueComponent implements OnInit {
    private league;
    profilePicture = "";
    leagueName = ""
    loading = false;

    constructor(
      private LeagueService: LeagueService,
      private router: Router,
      private ToastService: ToastService
    ) {}

    ngOnInit(): void {
      console.log("My Profile Init.")
      this.league = this.LeagueService.getLeague();
      this.profilePicture = `https://sleepercdn.com/avatars/${this.league.avatar}`;
      this.leagueName = this.league.name;
    }

}
