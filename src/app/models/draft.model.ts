// src/app/models/draft.model.ts
import { Draft, DraftPick } from './draft.interface'

export class DraftModel implements Draft {
  draft_id: string
  league_id: string
  type: string
  status: string
  start_time: number
  sport: string
  settings: any
  season_type: string
  season: string
  metadata: any
  last_picked: number
  last_message_time: number
  last_message_id: string
  draft_order: any
  creators: any
  created: number
  picks: DraftPick[] = []

  constructor(data: Draft) {
    Object.assign(this, data)
  }

  addPicks(picks: DraftPick[]) {
    this.picks = picks
  }
}
