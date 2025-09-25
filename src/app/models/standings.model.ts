// src/app/models/standings-team.model.ts

import { RosterModel } from './roster.model';
import { UserModel } from './user.model';
import { LeagueModel } from './league.model';
import { PlayerModel } from './player.model';
import { StandingsTeam } from './standings.interface';

export class StandingsTeamModel {
  roster: RosterModel;
  players: PlayerModel[];
  user: UserModel;
  league: LeagueModel;
  teamName: string;
  userName: string;
  avatar: string | null;
  wins: number;
  losses: number;
  fpts: number;
  fptsAgainst: number;
  streak: { type: 'win' | 'loss' | ''; total: number }; // <-- add this
  divisionName: string;
  divisionAvatar: string;
  leagueRank: number;
  divisionRank: number;
  

  constructor(init: StandingsTeam) {
    this.roster = init.roster;
    this.players = init.players ?? [];
    this.user = init.user;
    this.league = init.league;
    this.teamName = init.teamName ?? '';
    this.userName = init.userName ?? '';
    this.avatar = init.avatar ?? null;
    this.wins = init.wins ?? 0;
    this.losses = init.losses ?? 0;
    this.fpts = init.fpts ?? 0;
    this.fptsAgainst = init.fptsAgainst ?? 0;
    this.streak = init.streak || { type: '', total: 0 }; // <-- default value
    this.divisionName = init.divisionName ?? '';
    this.divisionAvatar = init.divisionAvatar ?? '';
    this.leagueRank = init.leagueRank ?? -1;
    this.divisionRank = init.divisionRank ?? -1;
  }

  // -------------------
  // Getters
  // -------------------

  getRoster(): RosterModel {
    return this.roster;
  }

  getPlayers(): PlayerModel[] {
    return this.players;
  }

  getUser(): UserModel {
    return this.user;
  }

  getLeague(): LeagueModel {
    return this.league;
  }

  getTeamName(): string {
    return this.teamName;
  }

  getUserName(): string {
    return this.userName;
  }

  getAvatar(): string | null {
    return this.avatar;
  }

  getWins(): number {
    return this.wins;
  }

  getLosses(): number {
    return this.losses;
  }

  getFpts(): number {
    return this.fpts;
  }

  getFptsAgainst(): number {
    return this.fptsAgainst;
  }

  getDivisionName(): string {
    return this.divisionName;
  }

  getDivisionAvatar(): string {
    return this.divisionAvatar;
  }
  getProfilePicture(): string {
        return this.avatar
        ? this.avatar
        : "assets/img/nfl.png";
    }

  // -------------------
  // Setters
  // -------------------
  setPlayers(players: PlayerModel[]): void {
    this.players = players;
  }

  // -------------------
  // Helpers
  // -------------------

  /** Win percentage (0–1). */
  getWinPct(): number {
    const games = this.wins + this.losses;
    return games > 0 ? this.wins / games : 0;
  }

  /** Record string like "10-3". */
  getRecord(): string {
    return `${this.wins}-${this.losses}`;
  }

  /** Point differential (points for – points against). */
  getPointDiff(): number {
    return this.fpts - this.fptsAgainst;
  }

  /** Average points scored per game. */
  getPointsPerGame(): number {
    const games = this.wins + this.losses;
    return games > 0 ? this.fpts / games : 0;
  }

  /** Average points allowed per game. */
  getPointsAgainstPerGame(): number {
    const games = this.wins + this.losses;
    return games > 0 ? this.fptsAgainst / games : 0;
  }

  /** Shortcut for checking if the team is in a division. */
  hasDivision(): boolean {
    return this.divisionName.trim().length > 0;
  }
}
