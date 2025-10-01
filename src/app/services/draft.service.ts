import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, forkJoin } from 'rxjs'
import { map, switchMap, tap } from 'rxjs/operators'
import { DraftModel } from '../models/draft.model'
import { Draft, DraftPick } from '../models/draft.interface'

@Injectable({ providedIn: 'root' })
export class DraftService {
  private draftsByLeague: Record<string, DraftModel[]> = {}
  private baseUrl = 'https://api.sleeper.app/v1'

  constructor(private http: HttpClient) {}

  getDraftsForLeague(leagueId: string): Observable<DraftModel[]> {
    // return cache if present
    if (this.draftsByLeague[leagueId]) {
      return of(this.draftsByLeague[leagueId])
    }

    return this.http
      .get<Draft[]>(`${this.baseUrl}/league/${leagueId}/drafts`)
      .pipe(
        map((drafts) => drafts.map((d) => new DraftModel(d))),
        tap((models) => (this.draftsByLeague[leagueId] = models))
      )
  }
  /** Get already loaded drafts synchronously */
  getCachedDrafts(leagueId: string): DraftModel[] | null {
    return this.draftsByLeague[leagueId] ?? null
  }

  getDraftPicks(draft: DraftModel): Observable<DraftPick[]> {
    // cached picks on the model
    if (draft.picks && draft.picks.length > 0) {
      return of(draft.picks)
    }

    return this.http
      .get<DraftPick[]>(`${this.baseUrl}/draft/${draft.draft_id}/picks`)
      .pipe(tap((picks) => draft.addPicks(picks)))
  }

  /**
   * Load drafts for a league and ensure each DraftModel has its picks loaded.
   * Returns Observable<DraftModel[]> where each DraftModel.picks is populated.
   */
  loadDraftsAndPicks(leagueId: string): Observable<DraftModel[]> {
    return this.getDraftsForLeague(leagueId).pipe(
      switchMap((drafts: DraftModel[]) => {
        if (!drafts || drafts.length === 0) {
          return of([] as DraftModel[])
        }

        // For each DraftModel produce an Observable<DraftModel> that resolves when picks are loaded
        const draftsWithPicks$: Observable<DraftModel>[] = drafts.map((d) =>
          this.getDraftPicks(d).pipe(
            map((picks: DraftPick[]) => {
              // ensure model has picks (getDraftPicks already does .addPicks via tap, but keep this to be explicit)
              d.addPicks(picks)
              return d
            })
          )
        )

        // forkJoin -> Observable<DraftModel[]>
        return forkJoin(draftsWithPicks$)
      })
    )
  }
}
