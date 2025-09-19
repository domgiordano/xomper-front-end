import { Roster } from './roster.interface';
import { User } from './user.interface';
import { League } from './league.interface';
import { Player } from './player.interface';

export interface StandingsTeam {
  roster: Roster;           // full roster
  players: Player[];        // List of players fully loaded
  user: User;               // user who owns the roster
  league: League;           // league of the roster
  teamName: string;
  userName: string;
  avatar: string | null;
  wins: number;
  losses: number;
  fpts: number;
  fptsAgainst: number;
}