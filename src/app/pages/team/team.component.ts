import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';
import { TeamService } from 'src/app/services/team.service';
import { Roster } from 'src/app/models/roster.interface';
import { League } from 'src/app/models/league.interface';

@Component({
  selector: 'app-search',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
    private team;
    teamPicture = "";
    teamName = ""
    teamRoster: Roster;
    teamLeague: League;
    loading = false;

    constructor(
      private UserService: UserService,
      private LeagueService: LeagueService,
      private router: Router,
      private ToastService: ToastService,
      private TeamService: TeamService
    ) {}

    ngOnInit(): void {
      console.log("Team Init.")
      this.team = this.TeamService.getCurrentTeam();
      this.teamPicture = this.TeamService.getTeamProfilePicture();
      this.teamName = this.TeamService.getTeamName();
      this.teamRoster = this.TeamService.getRoster();
      this.teamLeague = this.TeamService.getLeague();
    }

}
