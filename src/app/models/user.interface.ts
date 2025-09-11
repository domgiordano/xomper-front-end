export interface User {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;     // user avatar hash
  is_bot: boolean;
  is_owner: boolean;
  is_commissioner: boolean;
  metadata: {
    team_name?: string;
    location?: string;
    [key: string]: any;
  } | null;
  settings?: {
    theme?: string;
    notifications?: boolean;
    [key: string]: any;
  };
}
