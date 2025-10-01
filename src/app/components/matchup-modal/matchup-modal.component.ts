import { Component, EventEmitter, HostBinding, Input, OnChanges, Output } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin, map } from "rxjs";
import { zoomModalAnimation } from "src/app/animations/zoom-modal.animation";
import { TEAM_COLORS } from "src/app/constants/team-colors";
import { MatchupDisplay } from "src/app/models/matchup-display.interface";
import { Player } from "src/app/models/player.interface";
import { PlayerModel } from "src/app/models/player.model";
import { RosterModel } from "src/app/models/roster.model";
import { StandingsTeamModel } from "src/app/models/standings.model";
import { LeagueService } from "src/app/services/league.service";
import { PlayerService } from "src/app/services/player.service";
import { TeamService } from "src/app/services/team.service";

@Component({
  selector: 'app-matchup-modal',
  templateUrl: './matchup-modal.component.html',
  styleUrls: ['./matchup-modal.component.scss'],
  animations: [zoomModalAnimation]
})

export class MatchupModalComponent implements OnChanges {
  @Input() matchup!: MatchupDisplay;
  @Input() week!: number;
  @Input() startPos!: { top: number, left: number, width: number, height: number };
  @Output() close = new EventEmitter<void>();

  @HostBinding('@zoomAnimation') get zoom() {
    return { value: '', params: this.startPos || { top: 0, left: 0, width: 0, height: 0 } };
  }

  teamA!: StandingsTeamModel;
  teamB!: StandingsTeamModel;
  teamAPoints: number = 0;
  teamBPoints: number = 0;

  // TEAM A Players
  teamAPlayers: PlayerModel[] = [];
  teamASortedPlayers;
  teamAStarters: String[] = [];
  teamABench: String[] = [];
  teamATaxi: String[] = [];
  // TEAM B Players
  teamBPlayers: PlayerModel[] = [];
  teamBSortedPlayers;
  teamBStarters: String[] = [];
  teamBBench: String[] = [];
  teamBTaxi: String[] = [];

  POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  loading = false;

  constructor(
    private playerService: PlayerService,
    private TeamService: TeamService,
    private router: Router,
    private LeagueService: LeagueService
  ) { }

  ngOnChanges() {
    if (!this.matchup) return;

    this.teamA = this.matchup.teamA.standingsTeam;
    this.teamB = this.matchup.teamB.standingsTeam;
    this.teamAPoints = this.matchup.teamA.points;
    this.teamBPoints = this.matchup.teamB.points;

    if (this.teamAPlayers.length > 0 && this.teamBPlayers.length > 0) {
      this.teamASortedPlayers = this.sortPlayersIntoGroups(this.teamAPlayers, this.teamA.roster);
      this.teamBSortedPlayers = this.sortPlayersIntoGroups(this.teamBPlayers, this.teamB.roster);
      this.setPlayerGroups();
    } else {
      this.loadPlayers();
    }
    console.log("ROSTERS----------")
    console.log(this.matchup.teamA.standingsTeam.roster)
    console.log(this.matchup.teamB.standingsTeam.roster)
  }

  private loadPlayers() {
    this.loading = true;

    const teamAPlayerCalls = this.teamA.roster.players.map(id => this.playerService.getPlayerById(id));
    const teamBPlayerCalls = this.teamB.roster.players.map(id => this.playerService.getPlayerById(id));

    forkJoin([forkJoin(teamAPlayerCalls), forkJoin(teamBPlayerCalls)]).subscribe({
      next: ([teamAPlayers, teamBPlayers]) => {
        const playerAModels = teamAPlayers.map(player => new PlayerModel(player));
        const playerBModels = teamBPlayers.map(player => new PlayerModel(player));
        this.teamA.setPlayers(playerAModels);
        this.teamB.setPlayers(playerBModels);
        this.teamAPlayers = this.teamA.getPlayers();
        this.teamBPlayers = this.teamB.getPlayers();
        this.teamASortedPlayers = this.sortPlayersIntoGroups(this.teamAPlayers, this.teamA.roster);
        this.teamBSortedPlayers = this.sortPlayersIntoGroups(this.teamBPlayers, this.teamB.roster);
        this.setPlayerGroups()
      },
      error: (err) => {
        console.error('Failed to load matchup players:', err);
      },
      complete: () => (this.loading = false)
    });
  }
  setPlayerGroups() {
    this.teamAStarters = this.teamASortedPlayers.starters;
    this.teamABench = this.teamASortedPlayers.bench;
    this.teamATaxi = this.teamASortedPlayers.taxi;
    this.teamBStarters = this.teamBSortedPlayers.starters;
    this.teamBBench = this.teamBSortedPlayers.bench;
    this.teamBTaxi = this.teamBSortedPlayers.taxi;
  }
  sortPlayersIntoGroups(teamPlayers: PlayerModel[], teamRoster: RosterModel) {
    if (!teamPlayers || !teamRoster) {
      return { starters: [], bench: [], taxi: [] };
    }

    const startersSet = new Set(teamRoster.starters || []);
    const taxiSet = new Set(teamRoster.taxi || []);

    const starters: PlayerModel[] = [];
    const bench: PlayerModel[] = [];
    const taxi: PlayerModel[] = [];

    teamPlayers.forEach(player => {
      const id = player.player_id;
      if (startersSet.has(id)) {
        starters.push(player);
      } else if (taxiSet.has(id)) {
        taxi.push(player);
      } else {
        bench.push(player);
      }
    });
    // Sort each group by position
    const sortByPosition = (a: PlayerModel, b: PlayerModel) => {
      const aIndex = this.POSITION_ORDER.indexOf(a.position) >= 0 ? this.POSITION_ORDER.indexOf(a.position) : 99;
      const bIndex = this.POSITION_ORDER.indexOf(b.position) >= 0 ? this.POSITION_ORDER.indexOf(b.position) : 99;
      return aIndex - bIndex;
    };
    starters.sort(sortByPosition);
    bench.sort(sortByPosition);
    taxi.sort(sortByPosition);
    return { starters, bench, taxi };
  }


  onClose() {
    this.close.emit();
  }

  getTeamStyle(team: string | undefined) {
    if (!team) return { backgroundColor: '#2a2a2a', border: '2px solid #444' };
    const colors = TEAM_COLORS[team.toLowerCase()];
    return colors
      ? { background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#fff' }
      : { backgroundColor: '#2a2a2a', border: '2px solid #444' };
  }
  getTeamHeaderStyle(team: any, teamPoints: number, opponentPoints: number) {
    const neutralColor = '#2a2a2a';
    const winnerColor = 'linear-gradient(135deg, #4caf50, #81c784)';
    const loserColor = 'linear-gradient(135deg, #f44336, #e57373)';

    let bgColor = neutralColor;

    if (teamPoints != null && opponentPoints != null) {
      if (teamPoints > opponentPoints) {
        bgColor = winnerColor;
      } else if (teamPoints < opponentPoints) {
        bgColor = loserColor;
      }
    }

    return {
      'background': bgColor,
      'color': '#fff',
      'border-radius': '12px',
      'padding': '15px',
      'text-align': 'center',
      'box-shadow': '0 4px 12px rgba(0,0,0,0.3)',
      'transition': 'all 0.3s ease'
    };
  }
  goToTeam(team: StandingsTeamModel) {
    console.log(`Team Selected: ${team.getTeamName()}`);
    // verify league
    const leagueId = team.getLeague()?.getId()
    let league = this.LeagueService.getCurrentLeague()
    if (leagueId == this.LeagueService.getMyLeague().getId()){
      league = this.LeagueService.getMyLeague();
    }
    if (team.getTeamName() == this.TeamService.getMyTeam()?.getTeamName()) {
      console.log("Selected yourself - (conceited, pompous, self centered)")
      this.router.navigate(['/my-team'],
        {
          queryParams: {
            user: this.TeamService.getMyTeam().getUserName(),
            league: league.getId()
          }
        }
      );
    }
    else {
      this.TeamService.setCurrentTeam(team);
      this.router.navigate(['/selected-team'],
        {
          queryParams: {
            user: this.TeamService.getCurrentTeam().getUserName(),
            league: league.getId()
          }
        }
      );
    }
  }
}
