import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { LeagueService } from 'src/app/services/league.service';
import { StandingsService } from 'src/app/services/standings.service';
import { ToastService } from 'src/app/services/toast.service';
import { StandingsTeam } from 'src/app/models/standings.interface';
import { Roster } from 'src/app/models/roster.interface';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-search',
  templateUrl: './my-league.component.html',
  styleUrls: ['./my-league.component.scss']
})
export class MyLeagueComponent implements OnInit {
    private league;
    leaguePicture = "";
    leagueName = "";
    leagueId = "";
    leagueUsers;
    leagueRosters: Roster[] = [];
    standings: StandingsTeam[] = [];
    loading = false;

    constructor(
      private LeagueService: LeagueService,
      private router: Router,
      private ToastService: ToastService,
      private StandingsService: StandingsService,
      private TeamService: TeamService,
      private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      console.log("My League Init.")
      this.loading = true;
      this.league = this.LeagueService.reset();
      // Always check query params
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        const queryLeagueId = params['leagueId'];
        console.log("LeagueId from query:", queryLeagueId);

        // No league in service, fetch it by ID
        this.LeagueService.searchLeague(queryLeagueId).pipe(take(1)).subscribe({
          next: league => {
            console.log("League Found from query param:", league);
            this.LeagueService.setMyLeague(league);
            this.ToastService.showPositiveToast("League Loaded.");
            this.league = league;
            this.setupLeague();
          },
          error: err => {
            console.error("Error loading league from query param", err);
            this.ToastService.showNegativeToast("Error loading league.");
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      });
    }
    private setupLeague(): void {
      this.leaguePicture = this.LeagueService.getMyLeagueProfilePicture();
      this.leagueName = this.LeagueService.getMyLeagueName();
      this.leagueId = this.LeagueService.getMyLeagueId();
      this.leagueUsers = this.LeagueService.getMyLeagueUsers();

      if (this.leagueUsers.length === 0) {
        this.getLeagueUsers();
      } else {
        console.log("Already got dem league users.");
      }
    }
    getLeagueUsers(): void {
      this.loading = true;
      console.log('Getting League Users.');
      this.LeagueService.getLeagueUsers(this.leagueId).pipe(take(1)).subscribe({
        next: users => {
          console.log("League Users Found------");
          this.LeagueService.setMyLeagueUsers(users)
          this.leagueUsers = this.LeagueService.getMyLeagueUsers();
          this.ToastService.showPositiveToast("Users Found.")
          this.getLeagueRosters();
        },
        error: err => {
          console.error('Error Getting League Users', err);
          this.ToastService.showNegativeToast('Error Finding League Users.');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
    getLeagueRosters(): void {
      this.loading = true;
      console.log('Getting League Rosters.');
      this.LeagueService.getLeagueRosters(this.leagueId).pipe(take(1)).subscribe({
        next: rosters => {
          console.log("League Rosters Found------", rosters);
          this.LeagueService.setMyLeagueRosters(rosters);
          this.leagueRosters = this.LeagueService.getMyLeagueRosters();

          // Sort rosters by standings
          const sortedRosters = this.StandingsService.buildStandings(this.leagueRosters);

          // Build standings view model
          this.standings = sortedRosters.map(roster => {
            // Find the user object from leagueUsers
            const user = this.leagueUsers.find(u => u.user_id === roster.owner_id);
            // Parse streak from metadata.streak (example: "1W" or "2L")
            let streakType = '';
            let streakTotal = 0;
            if (roster.metadata?.streak) {
              const match = roster.metadata.streak.match(/(\d+)([WL])/);
              if (match) {
                streakTotal = parseInt(match[1], 10);
                streakType = match[2] === 'W' ? 'win' : 'loss';
              }
            }

            return {
              roster,
              user: user!,
              league: this.league!,
              teamName: user?.metadata?.team_name || `${user?.display_name}'s Team`,
              userName: user?.display_name || "Unknown User",
              avatar: user?.avatar ? this.LeagueService.buildAvatar(user.avatar) : "assets/img/nfl.png",
              wins: roster.settings?.wins ?? 0,
              losses: roster.settings?.losses ?? 0,
              fpts: (roster.settings?.fpts ?? 0) + ((roster.settings?.fpts_decimal ?? 0) / 100),
              fptsAgainst: (roster.settings?.fpts_against ?? 0) + ((roster.settings?.fpts_against_decimal ?? 0) / 100),
              streak: {
                type: streakType,
                total: streakTotal
              }
            };
          });

          this.ToastService.showPositiveToast("Rosters Found.");
        },
        error: err => {
          console.error('Error Getting League Rosters', err);
          this.ToastService.showNegativeToast('Error Finding League Rosters.');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
    selectCurrentTeam(team: StandingsTeam): void {
      console.log(`Team Selected: ${team.teamName}`);
      this.TeamService.setCurrentTeam(team);
      this.router.navigate(['/selected-team']);
    }
}