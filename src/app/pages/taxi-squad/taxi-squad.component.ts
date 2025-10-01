import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { PlayerService } from 'src/app/services/player.service';
import { LeagueService } from 'src/app/services/league.service';
import { PlayerModel } from 'src/app/models/player.model';
import { TEAM_COLORS } from 'src/app/constants/team-colors';

@Component({
  selector: 'app-taxi-squad',
  templateUrl: './taxi-squad.component.html',
  styleUrls: ['./taxi-squad.component.scss']
})
export class TaxiSquadComponent implements OnInit {
  taxiPlayers: PlayerModel[] = [];
  loading = false;
  selectedPlayer: PlayerModel | null = null;
  modalStart!: { top: number; left: number; width: number; height: number } | null;
  POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  constructor(
    private ToastService: ToastService,
    private PlayerService: PlayerService,
    private LeagueService: LeagueService
  ) {}

  ngOnInit(): void {
    this.loadTaxiPlayers();
  }

  loadTaxiPlayers(): void {
    const taxiIds = this.LeagueService.getMyLeague().getTaxiSquadIds();
    if (!taxiIds.length) return;

    this.loading = true;
    const calls = taxiIds.map(id => this.PlayerService.getPlayerById(id));

    forkJoin(calls).subscribe({
      next: players => {
        this.taxiPlayers = players.map(player => new PlayerModel(player));
        this.sortPlayers();
        this.ToastService.showPositiveToast('Taxi Squad Loaded Successfully.');
      },
      error: err => {
        console.error('Error loading Taxi Squad:', err);
        this.ToastService.showNegativeToast('Failed to load Taxi Squad.');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  sortPlayers() {
    const sortByPosition = (a: PlayerModel, b: PlayerModel) => {
      const aIndex = this.POSITION_ORDER.indexOf(a.position) >= 0 ? this.POSITION_ORDER.indexOf(a.position) : 99;
      const bIndex = this.POSITION_ORDER.indexOf(b.position) >= 0 ? this.POSITION_ORDER.indexOf(b.position) : 99;
      return aIndex - bIndex;
    };
    this.taxiPlayers.sort(sortByPosition);
  }

  openPlayerModal(player: PlayerModel, event: MouseEvent) {
    const card = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.modalStart = {
      top: card.top,
      left: card.left,
      width: card.width,
      height: card.height
    };
    this.selectedPlayer = player;
  }

  closePlayerModal() {
    this.selectedPlayer = null;
    this.modalStart = null;
  }

  getTeamStyle(team: string | undefined) {
    if (!team) return { backgroundColor: '#2a2a2a', border: '2px solid #444' };

    const key = team.toLowerCase();
    const colors = TEAM_COLORS[key];
    if (!colors) return { backgroundColor: '#2a2a2a', border: '2px solid #444' };

    return {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: '#fff'
    };
  }

  getTeamButtonStyle(team: string | undefined) {
    if (!team) return { background: '#444', color: '#fff' };

    const key = team.toLowerCase();
    const colors = TEAM_COLORS[key];
    if (!colors) return { background: '#444', color: '#fff' };

    return {
      backgroundColor: colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '20px',
      padding: '6px 14px',
      fontWeight: 'bold',
      cursor: 'pointer'
    };
  }
}
