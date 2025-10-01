import { Component, Input, OnInit } from '@angular/core'
import { forkJoin } from 'rxjs'
import { ToastService } from 'src/app/services/toast.service'
import { TeamService } from 'src/app/services/team.service'
import { RosterModel } from 'src/app/models/roster.model'
import { LeagueModel } from 'src/app/models/league.model'
import { PlayerModel } from 'src/app/models/player.model'
import { Player } from 'src/app/models/player.interface'
import { StandingsTeamModel } from 'src/app/models/standings.model'
import { TEAM_COLORS } from 'src/app/constants/team-colors'
import { Router } from '@angular/router'
import { UserService } from 'src/app/services/user.service'
import { LeagueService } from 'src/app/services/league.service'
import { PlayerService } from 'src/app/services/player.service'

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  @Input() mode: 'my' | 'selected' = 'selected'
  team: StandingsTeamModel
  teamPicture = ''
  teamName = ''
  teamRoster: RosterModel
  teamPlayers: PlayerModel[]
  starters: PlayerModel[] = []
  bench: PlayerModel[] = []
  taxi: PlayerModel[] = []
  teamLeague: LeagueModel
  loading = false
  selectedPlayer: PlayerModel | null = null
  modalStart!: {
    top: number
    left: number
    width: number
    height: number
  } | null
  POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']

  constructor(
    private ToastService: ToastService,
    private TeamService: TeamService,
    private PlayerService: PlayerService,
    private UserService: UserService,
    private LeagueService: LeagueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.mode === 'my') {
      this.team = this.TeamService.getMyTeam()
    } else {
      this.team = this.TeamService.getCurrentTeam()
    }
    //this.team = this.TeamService.getCurrentTeam();
    this.teamPicture = this.team.getProfilePicture()
    this.teamName = this.team.getTeamName()
    this.teamRoster = this.team.getRoster()
    this.teamLeague = this.team.getLeague()
    this.teamPlayers = this.team.getPlayers()
    // Always load roster
    console.log('Need the roster rq.')
    this.loadRosters()
  }

  loadRosters(): void {
    this.loading = true
    const playerCalls = this.teamRoster.players.map((playerId: string) =>
      this.PlayerService.getPlayerById(playerId)
    )
    // Call at once
    forkJoin(playerCalls).subscribe({
      next: (players: Player[]) => {
        const playerModels = players.map((player) => new PlayerModel(player))
        this.team.setPlayers(playerModels)
        if (this.mode == 'my') {
          this.TeamService.setMyTeam(this.team)
        } else {
          this.TeamService.setCurrentTeam(this.team)
        }
        this.teamPlayers = this.team.getPlayers()
        this.sortPlayersIntoGroups()
        console.log('Loaded players:', this.teamPlayers)
        this.ToastService.showPositiveToast('Successfully Loaded Team Players.')
      },
      error: (err) => {
        console.error('Error loading players:', err)
        this.ToastService.showNegativeToast('Failed to Load Team Players.')
        this.loading = false
      },
      complete: () => {
        this.loading = false
      },
    })
  }

  sortPlayersIntoGroups() {
    console.log('Sorting da players.')
    if (!this.teamPlayers || !this.teamRoster) return

    const startersSet = new Set(this.teamRoster.starters)
    const taxiSet = new Set(this.teamRoster.taxi)

    // Clear arrays in case of re-sort
    this.starters = []
    this.bench = []
    this.taxi = []

    this.teamPlayers.forEach((player) => {
      const id = player.player_id

      if (startersSet.has(id)) {
        this.starters.push(player)
      } else if (taxiSet.has(id)) {
        this.taxi.push(player)
      } else {
        this.bench.push(player)
      }
    })

    // Sort each group by position
    const sortByPosition = (a: PlayerModel, b: PlayerModel) => {
      const aIndex =
        this.POSITION_ORDER.indexOf(a.position) >= 0
          ? this.POSITION_ORDER.indexOf(a.position)
          : 99
      const bIndex =
        this.POSITION_ORDER.indexOf(b.position) >= 0
          ? this.POSITION_ORDER.indexOf(b.position)
          : 99
      return aIndex - bIndex
    }
    this.starters.sort(sortByPosition)
    this.bench.sort(sortByPosition)
    this.taxi.sort(sortByPosition)
  }
  //////////////////////
  ////// ROUTING //////
  ////////////////////
  goToUserProfile(userId: string) {
    if (!userId) return
    console.log(`User Selected: ${userId}`)
    if (userId == this.UserService.getMyUser()?.getUserId()) {
      console.log('Selected yourself - (conceited, pompous, self centered)')
      this.router.navigate(['/my-profile'], {
        queryParams: {
          userId: userId,
        },
      })
    } else {
      this.router.navigate(['/selected-profile'], {
        queryParams: {
          userId: userId,
        },
      })
    }
  }

  goToStandings(leagueId: string, view: string) {
    if (!leagueId) return
    console.log(`League Selected: ${leagueId}`)
    if (leagueId == this.LeagueService.getMyLeague()?.getId()) {
      console.log(
        'Selected your own league - (conceited, pompous, self centered)'
      )
      this.router.navigate(['/my-league'], {
        queryParams: {
          leagueId: leagueId,
          view: view,
        },
      })
    } else {
      this.router.navigate(['/selected-league'], {
        queryParams: {
          leagueId: leagueId,
          view: view,
        },
      })
    }
  }

  goToPlayer(player: PlayerModel) {
    console.log('Player selected-----', player)
    this.PlayerService.setCurrentPlayer(player)
    this.router.navigate(['/player'], {
      queryParams: {
        playerId: player.player_id,
      },
    })
  }

  openPlayerModal(player: PlayerModel, event: MouseEvent) {
    const card = (event.currentTarget as HTMLElement).getBoundingClientRect()
    this.modalStart = {
      top: card.top,
      left: card.left,
      width: card.width,
      height: card.height,
    }
    this.selectedPlayer = player
  }

  closePlayerModal() {
    this.selectedPlayer = null
    this.modalStart = null
  }
  getTeamStyle(team: string | undefined) {
    if (!team) {
      return {
        backgroundColor: '#2a2a2a',
        border: '2px solid #444',
      }
    }

    const key = team.toLowerCase()
    const colors = TEAM_COLORS[key]

    if (!colors) {
      return {
        backgroundColor: '#2a2a2a',
        border: '2px solid #444',
      }
    }

    return {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: '#fff',
    }
  }
  getTeamButtonStyle(team: string | undefined) {
    if (!team) return { background: '#444', color: '#fff' }

    const key = team.toLowerCase()
    const colors = TEAM_COLORS[key]
    if (!colors) return { background: '#444', color: '#fff' }

    return {
      backgroundColor: colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '20px',
      padding: '6px 14px',
      fontWeight: 'bold',
      cursor: 'pointer',
    }
  }
}
