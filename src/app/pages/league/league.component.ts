import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { LeagueService } from 'src/app/services/league.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.scss']
})
export class LeagueComponent implements OnInit {
    private leagueId = "";
    private league;
    profilePicture = "";
    leagueName = ""
    loading = false;

    constructor(
      private LeagueService: LeagueService,
      private UserService: UserService,
      private router: Router,
      private route: ActivatedRoute,
      private ToastService: ToastService
    ) {}

    ngOnInit(): void {
      console.log("League Init.")
      this.league = this.LeagueService.getCurrentLeague();
      this.leagueId = this.LeagueService.getCurrentLeagueId();
      this.leagueName = this.LeagueService.getCurrentLeagueName();
      this.profilePicture = this.LeagueService.getCurrentLeagueProfilePicture();
    }

}
