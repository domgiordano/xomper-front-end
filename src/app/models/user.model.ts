import { LeagueModel } from "./league.model";
import { User } from "./user.interface";

export class UserModel implements User {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  is_bot: boolean;
  is_owner: boolean;
  is_commissioner: boolean;
  metadata: { team_name?: string; location?: string; [key: string]: any } | null;
  settings?: { theme?: string; notifications?: boolean; [key: string]: any };
  leagues: LeagueModel[] = [];

  constructor(data: User) {
    Object.assign(this, data);
  }

  getProfilePicture(): string {
    return this.avatar
      ? `https://sleepercdn.com/avatars/${this.avatar}`
      : 'assets/img/nfl.png';
  }

  buildAvatar(avatar: string): string {
    return `https://sleepercdn.com/avatars/${avatar}`;
  }

  getDisplayName(): string {
    return this.display_name || this.username;
  }
  getUserId(): string {
    return this.user_id
  }
  getUserName(): string {
    return this.username;
  }

  // ---- LEAGUES ----
  setUserLeagues(newLeagues: LeagueModel[]): void {
    this.leagues = newLeagues;
  }

  getUserLeagues(): LeagueModel[] {
    return this.leagues;
  }


}