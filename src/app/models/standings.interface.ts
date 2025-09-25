import { RosterModel } from './roster.model';
import { UserModel } from './user.model';
import { LeagueModel } from './league.model';
import { PlayerModel } from './player.model';

export interface StandingsTeam {
  roster: RosterModel;           // full roster
  players: PlayerModel[];        // List of players fully loaded
  user: UserModel;               // user who owns the roster
  league: LeagueModel;           // league of the roster
  teamName: string;
  userName: string;
  avatar: string | null;
  wins: number;
  losses: number;
  fpts: number;
  fptsAgainst: number;
  streak: { type: 'win' | 'loss' | ''; total: number }; 
  divisionName: string;
  divisionAvatar: string;
  leagueRank: number;
  divisionRank: number;
}