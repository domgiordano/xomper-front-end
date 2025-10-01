// taxi-squad.model.ts
import { PlayerModel } from './player.model'
import { TaxiSquadPlayer } from './taxi-squad-player.interface'

export class TaxiSquadPlayerModel
  extends PlayerModel
  implements TaxiSquadPlayer
{
  rosterId: number
  ownerUserId: string
  ownerDisplayName: string
  ownerTeamName: string
  draftRound?: number
  draftPickNo?: number
  photoError?: boolean

  constructor(base: PlayerModel, extras: Partial<TaxiSquadPlayer>) {
    super(base) // inherit player fields
    Object.assign(this, extras)
  }
}
