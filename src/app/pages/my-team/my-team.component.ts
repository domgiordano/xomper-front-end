import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';
import { TeamService } from 'src/app/services/team.service';
import { Roster } from 'src/app/models/roster.interface';
import { League } from 'src/app/models/league.interface';
import { Player } from 'src/app/models/player.interface';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.scss']
})
export class MyTeamComponent implements OnInit {
    private team;
    teamPicture = "";
    teamName = ""
    teamRoster: Roster;
    teamPlayers: Player[];
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
      this.team = this.TeamService.getMyTeam();
      this.teamPicture = this.TeamService.getMyTeamProfilePicture();
      this.teamName = this.TeamService.getMyTeamName();
      this.teamRoster = this.TeamService.getMyTeamRoster();
      this.teamLeague = this.TeamService.getMyTeamLeague();
      this.teamPlayers = this.TeamService.getMyTeamPlayers();
      if (this.teamPlayers.length == 0) {
        console.log("Need the roster rq.")
        this.loadRosters();
      }
      else {
        console.log("You been here before - we got that roster.")
      }
    }

    loadRosters(): void {
      this.loading = true;
      const playerCalls = this.teamRoster.players.map((playerId: string) =>
        this.TeamService.getPlayerById(playerId)
      );
      // Call at once
      forkJoin(playerCalls).subscribe({
        next: (results: Player[]) => {
          this.teamPlayers = results;
          console.log('Loaded players:', this.teamPlayers);
          this.ToastService.showPositiveToast('Successfully Loaded Team Players.');
        },
        error: (err) => {
          console.error('Error loading players:', err);
          this.ToastService.showNegativeToast('Failed to Load Team Players.');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }

}
