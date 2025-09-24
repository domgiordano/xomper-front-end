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
import { StandingsTeam } from 'src/app/models/standings.interface';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
    private team: StandingsTeam;
    teamPicture = "";
    teamName = ""
    teamRoster: Roster;
    teamPlayers: Player[];
    starters: Player[] = [];
    bench: Player[] = [];
    taxi: Player[] = [];
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
      this.teamPicture = this.TeamService.getCurrentTeamProfilePicture();
      this.teamName = this.TeamService.getCurrentTeamName();
      this.teamRoster = this.TeamService.getCurrentTeamRoster();
      this.teamLeague = this.TeamService.getCurrentTeamLeague();
      this.teamPlayers = this.TeamService.getCurrentTeamPlayers();
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
          this.sortPlayersIntoGroups();
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

    sortPlayersIntoGroups() {
      console.log("Sorting da players.")
      if (!this.teamPlayers || !this.teamRoster) return;

      const startersSet = new Set(this.teamRoster.starters);
      const taxiSet = new Set(this.teamRoster.taxi);

      // Clear arrays in case of re-sort
      this.starters = [];
      this.bench = [];
      this.taxi = [];

      this.teamPlayers.forEach(player => {
        const id = player.player_id;

        if (startersSet.has(id)) {
          this.starters.push(player);
        } else if (taxiSet.has(id)) {
          this.taxi.push(player);
        } else {
          this.bench.push(player);
        }
      });
    }

    togglePlayerDetails(player: Player) {
      console.log("Player selected-----", player);
    }

}
