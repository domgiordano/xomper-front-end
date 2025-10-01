// taxi-squad.service.ts
import { Injectable } from '@angular/core'
import { LeagueService } from './league.service'
import { DraftService } from './draft.service'
import { PlayerService } from './player.service'
import { TaxiSquadPlayerModel } from '../models/taxi-squad-player.model'
import { Roster } from '../models/roster.interface'
import { DraftPick } from '../models/draft.interface'
import { forkJoin, map, Observable, of, switchMap } from 'rxjs'
import { PlayerModel } from '../models/player.model'

@Injectable({ providedIn: 'root' })
export class TaxiSquadService {
  constructor(
    private LeagueService: LeagueService,
    private DraftService: DraftService,
    private PlayerService: PlayerService
  ) {}

  loadTaxiSquadPlayers(leagueId: string): Observable<TaxiSquadPlayerModel[]> {
    return this.DraftService.getDraftsForLeague(leagueId).pipe(
      switchMap((drafts) => {
        const league = this.LeagueService.getMyLeague()
        const picks = drafts.map((draft) => draft.picks)
        const combinedPicks = picks.flat()

        const taxiPlayerRequests: Observable<TaxiSquadPlayerModel>[] = []

        league.rosters.forEach((roster: Roster) => {
          const ownerUser = league.users.find(
            (u) => u.user_id === roster.owner_id
          )
          const ownerTeam = league.standingsTeams.find(
            (st) => st.user.user_id === ownerUser.user_id
          )

          roster.taxi?.forEach((playerId) => {
            // now async
            const player$ = this.PlayerService.getPlayerById(playerId).pipe(
              map((playerData) => {
                const draftPick = combinedPicks.find(
                  (p) => p.player_id === playerId
                )

                const basePlayer = new PlayerModel(playerData)

                const taxiModel = new TaxiSquadPlayerModel(basePlayer, {
                  rosterId: roster.roster_id,
                  ownerUserId: ownerUser?.user_id ?? '',
                  ownerDisplayName: ownerUser?.display_name ?? '',
                  ownerTeamName: ownerTeam?.teamName ?? '',
                  draftRound: draftPick?.round ?? -1,
                  draftPickNo: draftPick?.draft_slot ?? -1,
                })
                return taxiModel
              })
            )

            taxiPlayerRequests.push(player$)
          })
        })

        // wait for all player requests to resolve
        return taxiPlayerRequests.length ? forkJoin(taxiPlayerRequests) : of([])
      })
    )
  }
}
