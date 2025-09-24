import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { LeagueService } from 'src/app/services/league.service';
import { StandingsService } from 'src/app/services/standings.service';
import { ToastService } from 'src/app/services/toast.service';
import { StandingsTeam } from 'src/app/models/standings.interface';
import { Roster } from 'src/app/models/roster.interface';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { UserModel } from 'src/app/models/user.model';
import { LeagueModel } from 'src/app/models/league.model';

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.scss']
})
export class LeagueComponent implements OnInit {
    viewMode: 'league' | 'division' = 'league'; // default to full league
    private league: LeagueModel;
    leaguePicture = "";
    leagueName = "";
    leagueId = "";
    leagueUsers;
    leagueDivisions: string[];
    leagueRosters: Roster[] = [];
    standings: StandingsTeam[] = [];
    standingsByDivision: { [division: string]: StandingsTeam[] };
    loading = false;

    constructor(
      private LeagueService: LeagueService,
      private router: Router,
      private ToastService: ToastService,
      private StandingsService: StandingsService,
      private TeamService: TeamService,
      private UserService: UserService,
      private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      console.log("League Init.")
      this.loading = true;
      // Always check query params
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        const queryLeagueId = params['leagueId'];
        console.log("LeagueId from query:", queryLeagueId);
        
        // Always fetch league
        this.LeagueService.searchLeague(queryLeagueId).pipe(take(1)).subscribe({
          next: league => {
            console.log("League Found from query param:", league);
            this.LeagueService.setCurrentLeague(league);
            this.ToastService.showPositiveToast("League Loaded.");
            this.league = this.LeagueService.getCurrentLeague();
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
      this.leaguePicture = this.league.getProfilePicture();
      this.leagueName = this.league.getDisplayName();
      this.leagueId = this.league.getId();
      this.leagueUsers = this.league.getUsers();
      this.league.setDivisions();
      this.leagueDivisions = this.league.getDivisions();
      this.getLeagueUsers();
    }
    getLeagueUsers(): void {
      this.loading = true;
      console.log('Getting League Users.');
      this.LeagueService.findLeagueUsers(this.leagueId).pipe(take(1)).subscribe({
        next: users => {
          console.log("League Users Found------");
          const userModels = users.map(user => new UserModel(user));
          this.league.setUsers(userModels)
          this.leagueUsers = this.league.getUsers();
          //this.ToastService.showPositiveToast("Users Found.")
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
      this.LeagueService.findLeagueRosters(this.leagueId).pipe(take(1)).subscribe({
        next: rosters => {
          console.log("League Rosters Found------", rosters);
          this.league.setRosters(rosters);
          this.leagueRosters = this.league.getRosters();

          // Sort rosters by standings
          //const sortedRosters = this.StandingsService.buildStandings(this.leagueRosters, false);

          // Build standings view model
          this.standings = this.leagueRosters.map(roster => {
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

            let divisionIndex = roster.settings?.division - 1;

            return {
              roster,
              players: [],
              user: user!,
              league: this.league!,
              teamName: user?.metadata?.team_name || `${user?.display_name}'s Team`,
              userName: user?.display_name || "Unknown User",
              avatar: user?.avatar ? this.UserService.buildAvatar(user.avatar) : "assets/img/nfl.png",
              wins: roster.settings?.wins ?? 0,
              losses: roster.settings?.losses ?? 0,
              fpts: (roster.settings?.fpts ?? 0) + ((roster.settings?.fpts_decimal ?? 0) / 100),
              fptsAgainst: (roster.settings?.fpts_against ?? 0) + ((roster.settings?.fpts_against_decimal ?? 0) / 100),
              streak: {
                type: streakType,
                total: streakTotal
              },
              divisionName: this.leagueDivisions[divisionIndex],
              divisionIndex: divisionIndex
            };
          });

          //this.ToastService.showPositiveToast("Rosters Found.");
        },
        error: err => {
          console.error('Error Getting League Rosters', err);
          this.ToastService.showNegativeToast('Error Finding League Rosters.');
          this.loading = false;
        },
        complete: () => {
          // Sort league
          this.standings = this.StandingsService.buildStandings(this.standings);
          // dynamically build division -> teams map
          this.standingsByDivision = {};
          this.standings.forEach(team => {
            const division = team.divisionName || "Unknown Division";
            if (!this.standingsByDivision[division]) {
              this.standingsByDivision[division] = [];
            }
            this.standingsByDivision[division].push(team);
          });

          console.log('Standings by division:', this.standingsByDivision);
          this.loading = false;
        }
      });
    }
    selectCurrentTeam(team: StandingsTeam): void {
      console.log(`Team Selected: ${team.teamName}`);
      if (team.teamName == this.TeamService.getMyTeamName()) {
        console.log("Selected yourself - (conceited, pompous, self centered)")
        this.router.navigate(['/my-team'],
          {
            queryParams: { 
              user: this.TeamService.getMyTeamUserName(), 
              league: this.league.getId() 
            }
          }
        );
      }
      else {
        this.TeamService.setCurrentTeam(team);
        this.router.navigate(['/selected-team'],
          {
            queryParams: { 
              user: this.TeamService.getCurrentTeamUserName(), 
              league: this.league.getId() 
            }
          }
        );
      }
      
    }
    goToUserProfile(userId: string): void {
      console.log(`User Selected: ${userId}`)
      if (userId == this.UserService.getMyUser()?.getUserId()){
        console.log("Selected yourself - (conceited, pompous, self centered)")
        this.router.navigate(['/my-profile'],
          {
            queryParams: { 
              userId: userId
            }
          }
        );
      }
      else {
        this.router.navigate(['/selected-profile'],
          {
            queryParams: { 
              userId: userId
            }
          }
        );
      }
    }

}