import { Player } from "./player.interface";

export class PlayerModel implements Player {
  hashtag: string;
  depth_chart_position: number;
  status: string;
  sport: string;
  fantasy_positions: string[];
  number: number;
  search_last_name: string;
  injury_start_date: string | null;
  weight: string;
  position: string;
  practice_participation: string | null;
  sportradar_id: string;
  team: string;
  last_name: string;
  college: string;
  fantasy_data_id: number;
  injury_status: string | null;
  player_id: string;
  height: string;
  search_full_name: string;
  age: number;
  stats_id: string;
  birth_country: string;
  espn_id: string;
  search_rank: number;
  first_name: string;
  depth_chart_order: number;
  years_exp: number;
  rotowire_id: number | null;
  rotoworld_id: number | null;
  search_first_name: string;
  yahoo_id: string | null;

  constructor(data: Player) {
    Object.assign(this, data);
  }

  // ---- HELPERS ----
  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  getDisplayPosition(): string {
    return this.position || (this.fantasy_positions?.[0] ?? "N/A");
  }

  getTeam(): string {
    return this.team || "FA"; // FA = Free Agent
  }

  getAge(): string {
    return this.age ? `${this.age} yrs` : "N/A";
  }

  getCollege(): string {
    return this.college || "Unknown";
  }

  isInjured(): boolean {
    return this.injury_status !== null;
  }

  getDepthChartInfo(): string {
    return this.depth_chart_position
      ? `${this.getDisplayPosition()} (Depth ${this.depth_chart_position})`
      : this.getDisplayPosition();
  }

  getProfilePicture(): string {
    // Sleeper player pics sometimes are stored under player_id
    return `https://sleepercdn.com/content/nfl/players/${this.player_id}.jpg`;
  }
  
  getThumbPicture(): string {
    return `https://sleepercdn.com/content/nfl/players/thumb/${this.player_id}.jpg`

  }
  getTeamPicture(): string {
    return `https://sleepercdn.com/images/team_logos/nfl/${this.team.toLowerCase()}.png`;
  }
}
