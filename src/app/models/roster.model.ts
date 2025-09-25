import { Roster } from "./roster.interface";
import { PlayerModel } from "./player.model";
import { UserModel } from "./user.model";

export class RosterModel implements Roster {
  co_owners: string[] | null;
  keepers: string[] | null;
  league_id: string;
  metadata: {
    allow_pn_inactive_starters?: string;
    allow_pn_player_injury_status?: string;
    allow_pn_scoring?: string;
    record?: string;
    restrict_pn_scoring_starters_only?: string;
    [key: string]: any;
  } | null;
  owner_id: string | null;
  player_map: Record<string, any> | null;
  players: string[] | null;
  reserve: string[] | null;
  roster_id: number;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    division: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
    waiver_position?: number;
    waiver_budget_used?: number;
    total_moves?: number;
    [key: string]: any;
  };
  starters: string[] | null;
  taxi: string[] | null;

  // --- extra state ---
  private owner: UserModel | null = null;
  private playerModels: PlayerModel[] = [];

  constructor(data: Roster) {
    Object.assign(this, data);
  }

  // ---- OWNER ----
  setOwner(user: UserModel): void {
    this.owner = user;
  }

  getOwner(): UserModel | null {
    return this.owner;
  }

  getOwnerName(): string {
    return this.owner ? this.owner.getDisplayName() : "Unknown Owner";
  }

  // ---- PLAYERS ----
  setPlayers(players: PlayerModel[]): void {
    this.playerModels = players;
  }

  getPlayers(): PlayerModel[] {
    return this.playerModels;
  }

  getStarters(): PlayerModel[] {
    if (!this.starters || !this.playerModels.length) return [];
    return this.playerModels.filter(p => this.starters?.includes(p.player_id));
  }

  getBench(): PlayerModel[] {
    if (!this.players || !this.starters) return [];
    return this.playerModels.filter(
      p => this.players?.includes(p.player_id) && !this.starters?.includes(p.player_id)
    );
  }

  getTaxiSquad(): PlayerModel[] {
    if (!this.taxi) return [];
    return this.playerModels.filter(p => this.taxi?.includes(p.player_id));
  }

  getReserve(): PlayerModel[] {
    if (!this.reserve) return [];
    return this.playerModels.filter(p => this.reserve?.includes(p.player_id));
  }

  // ---- RECORD / SETTINGS ----
  getRecord(): string {
    return `${this.settings.wins}-${this.settings.losses}${this.settings.ties > 0 ? `-${this.settings.ties}` : ""}`;
  }

  getPointsFor(): number {
    return this.settings.fpts + this.settings.fpts_decimal / 100;
  }

  getPointsAgainst(): number {
    return this.settings.fpts_against + this.settings.fpts_against_decimal / 100;
  }

  getDivision(): number {
    return this.settings.division;
  }
}
