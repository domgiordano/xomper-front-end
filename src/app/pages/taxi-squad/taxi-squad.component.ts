import { Component, OnInit } from '@angular/core'
import { ToastService } from 'src/app/services/toast.service'
import { LeagueService } from 'src/app/services/league.service'
import { TaxiSquadService } from 'src/app/services/taxi-squad.service'
import { DraftService } from 'src/app/services/draft.service'
import { TaxiSquadPlayerModel } from 'src/app/models/taxi-squad-player.model'
import { LeagueModel } from 'src/app/models/league.model'
import { TEAM_COLORS } from 'src/app/constants/team-colors'

@Component({
  selector: 'app-taxi-squad',
  templateUrl: './taxi-squad.component.html',
  styleUrls: ['./taxi-squad.component.scss'],
})
export class TaxiSquadComponent implements OnInit {
  league!: LeagueModel
  taxiPlayers: TaxiSquadPlayerModel[] = []
  loading = false
  selectedPlayer: TaxiSquadPlayerModel | null = null
  modalStart!: {
    top: number
    left: number
    width: number
    height: number
  } | null

  POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
  tabs = [
    { key: 'round', label: 'Draft Round' },
    { key: 'position', label: 'Position' },
    { key: 'owner', label: 'Owner' },
  ]
  selectedTab = 'round'

  constructor(
    private ToastService: ToastService,
    private LeagueService: LeagueService,
    private TaxiSquadService: TaxiSquadService,
    private DraftService: DraftService
  ) {}

  ngOnInit(): void {
    this.league = this.LeagueService.getMyLeague()
    this.loadTaxiPlayers()
  }

  loadTaxiPlayers(): void {
    if (!this.league) return

    this.loading = true

    // Step 1: Ensure all drafts + picks for this league are loaded
    this.DraftService.loadDraftsAndPicks(this.league.league_id).subscribe({
      next: () => {
        // Step 2: Build Taxi Squad players from service
        this.TaxiSquadService.loadTaxiSquadPlayers(
          this.league.league_id
        ).subscribe({
          next: (players) => {
            this.taxiPlayers = players
            this.sortPlayers()
            this.ToastService.showPositiveToast(
              'Taxi Squad Loaded Successfully.'
            )
          },
          error: (err) => {
            console.error('Error building Taxi Squad:', err)
            this.ToastService.showNegativeToast('Failed to build Taxi Squad.')
          },
          complete: () => {
            this.loading = false
          },
        })
      },
      error: (err) => {
        console.error('Error loading drafts:', err)
        this.ToastService.showNegativeToast('Failed to load draft data.')
        this.loading = false
      },
    })
  }

  sortPlayers() {
    this.taxiPlayers.sort((a, b) => {
      const aIndex = this.POSITION_ORDER.indexOf(a.position)
      const bIndex = this.POSITION_ORDER.indexOf(b.position)
      return (aIndex >= 0 ? aIndex : 99) - (bIndex >= 0 ? bIndex : 99)
    })
  }

  openPlayerModal(player: TaxiSquadPlayerModel, event: MouseEvent) {
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
    if (!team) return { backgroundColor: '#2a2a2a', border: '2px solid #444' }

    const colors = TEAM_COLORS[team.toLowerCase()]
    if (!colors) return { backgroundColor: '#2a2a2a', border: '2px solid #444' }

    return {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: '#fff',
    }
  }

  getTeamButtonStyle(team: string | undefined) {
    if (!team) return { background: '#444', color: '#fff' }

    const colors = TEAM_COLORS[team.toLowerCase()]
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
  // Helpers
  getPlayersGroupedByRound() {
    // Sort rounds numerically, but put -1 (undrafted) at the end
    const rounds = [
      ...new Set(this.taxiPlayers.map((p) => p.draftRound ?? -1)),
    ].sort((a, b) => {
      if (a === -1) return 1
      if (b === -1) return -1
      return a - b
    })

    const grouped: { round: number; players: TaxiSquadPlayerModel[] }[] = []
    rounds.forEach((r) => {
      grouped.push({
        round: r,
        players: this.taxiPlayers.filter((p) => (p.draftRound ?? -1) === r),
      })
    })
    return grouped
  }

  getPlayersGroupedByPosition() {
    const order = ['QB', 'RB', 'WR', 'TE']
    return order.map((pos) => ({
      position: pos,
      players: this.taxiPlayers.filter((p) => p.position === pos),
    }))
  }

  getPlayersGroupedByOwner() {
    const owners = [...new Set(this.taxiPlayers.map((p) => p.ownerDisplayName))]
    return owners.map((owner) => ({
      ownerDisplayName: owner,
      ownerTeamName: this.taxiPlayers.find((p) => p.ownerDisplayName === owner)
        ?.ownerTeamName,
      players: this.taxiPlayers.filter((p) => p.ownerDisplayName === owner),
    }))
  }
}
