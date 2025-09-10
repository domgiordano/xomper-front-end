import { Roster } from './roster.interface';
import { User } from './user.interface';
import { League } from './league.interface';

export interface StandingsTeam {
  roster: Roster;           // full roster
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