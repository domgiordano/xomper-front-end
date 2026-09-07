import { Injectable } from '@angular/core'
import { DraftPick } from '../models/draft.interface'
import { ValueBook } from '../models/value-book.model'

/** How to weight the board. */
export type StrategyPreset = 'bpa' | 'needs' | 'rb-heavy' | 'wr-heavy' | 'qb-early'

export const STRATEGY_LABELS: Record<StrategyPreset, string> = {
  bpa: 'Best available',
  needs: 'Fill my needs',
  'rb-heavy': 'RB heavy',
  'wr-heavy': 'WR heavy',
  'qb-early': 'QB early',
}

/** The user's own tweaks on top of a preset. */
export interface BoardPrefs {
  preset: StrategyPreset
  /** Player ids to float to the top regardless of value. */
  likes: Set<string>
  /** Player ids to bury. Never suggested while anything else remains. */
  dislikes: Set<string>
}

export function emptyPrefs(): BoardPrefs {
  return { preset: 'bpa', likes: new Set(), dislikes: new Set() }
}

/** One row on the suggestion board. */
export interface DraftCandidate {
  playerId: string
  name: string
  position: string
  /** Raw value from the league's book. */
  value: number
  /** Value above the last starter at this position. */
  surplus: number
  /** Value after the strategy is applied. What the list is sorted on. */
  score: number
  /** Why this sits where it does, e.g. "RB heavy" or "You need RB". */
  reason: string
  liked: boolean
}

interface PlayerMeta {
  first_name?: string
  last_name?: string
  position?: string
}

/** Positions worth suggesting. Everything else is noise on a draft board. */
const DRAFTABLE = new Set(['QB', 'RB', 'WR', 'TE'])

/** Preset -> position -> multiplier. Absent means 1. */
const PRESET_WEIGHTS: Record<StrategyPreset, Record<string, number>> = {
  bpa: {},
  needs: {},
  'rb-heavy': { RB: 1.25 },
  'wr-heavy': { WR: 1.25 },
  'qb-early': { QB: 1.35 },
}

/**
 * The lineup this league actually starts.
 *
 * Everything about what a position is worth follows from this. A hardcoded
 * table said a team wanted two quarterbacks, so a one-QB league kept being
 * told it needed another after the first.
 */
export interface LeagueShape {
  teams: number
  /** Starting slots by position, FLEX resolved into its eligible positions. */
  starters: Record<string, number>
}

/** Which positions can fill a FLEX, and how a flex slot is shared out. */
const FLEX_ELIGIBLE: Record<string, string[]> = {
  FLEX: ['RB', 'WR', 'TE'],
  WRRB_FLEX: ['RB', 'WR'],
  REC_FLEX: ['WR', 'TE'],
  SUPER_FLEX: ['QB', 'RB', 'WR', 'TE'],
}

/**
 * Read the league's starting lineup out of Sleeper's roster_positions.
 *
 * A flex slot is split across the positions that can fill it, because that is
 * how it moves replacement level: one FLEX in a twelve-team league pushes
 * about four extra RB, WR and TE into starting duty between them.
 */
export function leagueShape(
  rosterPositions: string[] | null | undefined,
  teams: number,
): LeagueShape {
  const starters: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0 }

  for (const slot of rosterPositions ?? []) {
    if (slot === 'BN' || slot === 'IR' || slot === 'TAXI') continue
    if (starters[slot] !== undefined) {
      starters[slot] += 1
      continue
    }
    const eligible = FLEX_ELIGIBLE[slot]
    if (!eligible) continue
    for (const position of eligible) {
      if (starters[position] !== undefined) starters[position] += 1 / eligible.length
    }
  }

  return { teams: Math.max(1, teams), starters }
}

/**
 * How far down a position the league starts before the next one is a bench
 * player.
 *
 * The standard replacement-level definition: the best player left at a
 * position once every team has filled its starting slots there. In a
 * twelve-team league starting one QB that is QB12, so QB13 is worth roughly
 * nothing over what you could stream.
 */
function replacementRank(shape: LeagueShape, position: string): number {
  return Math.round(shape.teams * (shape.starters[position] ?? 0))
}

/** Weight applied per starting slot the user is still short of. */
const NEED_STEP = 0.12

/** How much each extra body past the usable count discounts a position. */
const BENCH_STEP = 0.35

/**
 * How many past the starters are still worth roster space.
 *
 * Not the same question as how many you start. You want running back and
 * receiver depth -- they get hurt, they bye, and flex slots eat them. You do
 * not want a second quarterback in a one-QB league: the twelfth-best QB is on
 * waivers all season, so the backup is a stream, not an asset.
 */
const BENCH_DEPTH: Record<string, number> = { QB: 0, RB: 3, WR: 3, TE: 1 }

/**
 * What a position is worth once you have all of it you can use.
 *
 * Low on purpose. A second quarterback should not outrank anything you would
 * actually start.
 */
const BENCH_FLOOR = 0.05

/**
 * Ranks who is left on the board.
 *
 * The live draft page already showed what had happened — picks, order, a
 * countdown — with no reference to player values at all. It could tell you
 * the pick was in, not whether it was a good one, and it had nothing to say
 * about who to take next.
 *
 * The ranking is deliberately explainable: a multiplier on the league's own
 * value, with the reason carried on every row. A user disagreeing with the
 * order can see why it came out that way and override it with likes and
 * dislikes, which is more useful than a better-hidden model.
 */
@Injectable({ providedIn: 'root' })
export class DraftAssistantService {
  /**
   * Player ids already taken in this draft.
   *
   * Picks carry `player_id`; anything falsy is a pick that has not resolved
   * yet, not an available player.
   */
  draftedIds(picks: DraftPick[]): Set<string> {
    return new Set(picks.map((p) => p.player_id).filter(Boolean))
  }

  /**
   * Everyone already on a roster in this league.
   *
   * In a dynasty league almost nobody in the pool is actually free: they were
   * drafted in an earlier season and kept, so they never appear in this
   * draft's picks. Ranking on picks alone offered players who have been
   * rostered for years as "best available".
   */
  rosteredIds(rosters: Array<{ players?: string[] | null }>): Set<string> {
    const ids = new Set<string>()
    for (const roster of rosters) {
      for (const playerId of roster.players ?? []) {
        if (playerId) ids.add(playerId)
      }
    }
    return ids
  }

  /** How many of each position the given user has taken so far. */
  positionCounts(
    picks: DraftPick[],
    playerMap: Record<string, PlayerMeta>,
    userId: string | null,
  ): Record<string, number> {
    const counts: Record<string, number> = {}
    if (!userId) return counts

    for (const pick of picks) {
      if (pick.picked_by !== userId || !pick.player_id) continue
      const position = playerMap[pick.player_id]?.position
      if (!position) continue
      counts[position] = (counts[position] ?? 0) + 1
    }
    return counts
  }

  /**
   * The board, best first.
   *
   * `limit` exists because a draft pool is thousands of players and nobody
   * scrolls past the top of it mid-pick.
   */
  suggest(
    picks: DraftPick[],
    playerMap: Record<string, PlayerMeta>,
    book: ValueBook,
    prefs: BoardPrefs,
    myUserId: string | null,
    limit = 25,
    /**
     * Already rostered, so unavailable regardless of this draft. Empty for a
     * startup draft, where every pick is the only claim on a player.
     */
    rostered: Set<string> = new Set(),
    /**
     * The lineup this league starts. Without it every position is priced as
     * though the league started one of each.
     */
    shape: LeagueShape = { teams: 12, starters: { QB: 1, RB: 2, WR: 2, TE: 1 } },
  ): DraftCandidate[] {
    const drafted = this.draftedIds(picks)
    const counts = this.positionCounts(picks, playerMap, myUserId)
    const replacement = this.replacementValues(book, playerMap, drafted, rostered, shape)

    const candidates: DraftCandidate[] = []

    for (const playerId of book.playerIds) {
      if (drafted.has(playerId) || rostered.has(playerId)) continue

      const meta = playerMap[playerId]
      const position = meta?.position ?? book.position(playerId) ?? ''
      if (!DRAFTABLE.has(position)) continue

      const lookup = book.value(playerId)
      // An unknown value is not a zero-value player — it is a player this
      // league's source cannot price, and guessing would put them last.
      if (!lookup.known) continue

      const { multiplier, reason } = this.weightFor(position, prefs.preset, counts, shape)

      /**
       * A preset that names a position is a stated intent, so it prices that
       * position on raw value rather than surplus. Asking for "QB early" and
       * getting the scarcity answer back is the tool overruling you; the
       * default board is where the scarcity maths belongs.
       */
      const base = PRESET_WEIGHTS[prefs.preset][position]
        ? lookup.value
        : Math.max(0, lookup.value - (replacement[position] ?? 0))
      const liked = prefs.likes.has(playerId)
      const disliked = prefs.dislikes.has(playerId)

      candidates.push({
        playerId,
        name: [meta?.first_name, meta?.last_name].filter(Boolean).join(' ') || playerId,
        position,
        value: lookup.value,
        // Surplus over replacement, not raw value. The best QB left and the
        // best RB left are not comparable numbers until you subtract what
        // each position gives you for free.
        surplus: Math.max(0, lookup.value - (replacement[position] ?? 0)),
        // Likes float to the top and dislikes sink below everyone else, so
        // the user's own read always beats the preset.
        score: disliked ? -1 : base * multiplier,
        reason: liked ? 'On your list' : disliked ? 'Buried by you' : reason,
        liked,
      })
    }

    /**
     * Likes first, dislikes last, then by score.
     *
     * A sort tier rather than a multiplier: scoring by surplus means a player
     * at replacement level scores zero, and a thousand times zero is still
     * zero -- so the old x1000 boost silently failed to float exactly the
     * players a preference matters most for.
     */
    candidates.sort((a, b) => {
      if (a.liked !== b.liked) return a.liked ? -1 : 1
      const aBuried = a.score < 0
      const bBuried = b.score < 0
      if (aBuried !== bBuried) return aBuried ? 1 : -1
      return b.score - a.score
    })
    return candidates.slice(0, limit)
  }

  /**
   * The value of the best player left at each position once every team has
   * filled its starting slots there.
   *
   * Recomputed per call rather than cached, because it moves with the draft:
   * when a position runs, replacement rises and everyone left at it is worth
   * less than they were a pick ago.
   */
  private replacementValues(
    book: ValueBook,
    playerMap: Record<string, PlayerMeta>,
    drafted: Set<string>,
    rostered: Set<string>,
    shape: LeagueShape,
  ): Record<string, number> {
    const byPosition: Record<string, number[]> = {}

    for (const playerId of book.playerIds) {
      if (drafted.has(playerId) || rostered.has(playerId)) continue
      const position = playerMap[playerId]?.position ?? book.position(playerId) ?? ''
      if (!DRAFTABLE.has(position)) continue
      const lookup = book.value(playerId)
      if (!lookup.known) continue
      ;(byPosition[position] ??= []).push(lookup.value)
    }

    const out: Record<string, number> = {}
    for (const [position, values] of Object.entries(byPosition)) {
      values.sort((a, b) => b - a)
      const rank = replacementRank(shape, position)
      // Past the end of the pool everyone left is replacement level.
      out[position] = values[Math.min(rank, values.length - 1)] ?? 0
    }
    return out
  }

  /**
   * How much a position is still worth to this roster.
   *
   * Once the starting slots are filled, another one of that position is a
   * bench player, whatever his projection says. This is the whole reason a
   * one-QB league kept being told to take a second quarterback: the default
   * board applied no positional weighting at all, and the needs preset used a
   * hardcoded target of two.
   */
  private weightFor(
    position: string,
    preset: StrategyPreset,
    counts: Record<string, number>,
    shape: LeagueShape,
  ): { multiplier: number; reason: string } {
    const slots = Math.ceil(shape.starters[position] ?? 0)
    const have = counts[position] ?? 0
    const short = Math.max(0, slots - have)

    // How many of this position are worth having at all, starters plus the
    // depth the position actually warrants.
    const usable = slots + (slots > 0 ? (BENCH_DEPTH[position] ?? 1) : 0)

    // Applies to every preset, not just "fill my needs". A board that ignores
    // your roster is a ranking, not a recommendation.
    let multiplier = 1
    let reason: string
    if (short > 0) {
      multiplier = 1 + Math.min(short, 2) * NEED_STEP
      reason = have === 0 ? `No ${position} yet` : `Still short at ${position}`
    } else if (have >= usable) {
      // Nothing left to gain here. A backup you would never start should not
      // outrank someone you would.
      multiplier = BENCH_FLOOR
      reason = `${position} done`
    } else {
      // Depth past the starters is worth having, but not at starter prices.
      const over = have - slots
      multiplier = Math.max(BENCH_FLOOR, 1 - (over + 1) * BENCH_STEP)
      reason = `${position} starters set`
    }

    const preferred = PRESET_WEIGHTS[preset][position]
    if (preferred) {
      return { multiplier: multiplier * preferred, reason: STRATEGY_LABELS[preset] }
    }

    return { multiplier, reason }
  }
}
