/**
 * Tests for the draft assistant.
 *
 * The live draft board showed what had happened and nothing about what to do
 * next. This ranks who is left, so the ordering rules are the product — a
 * wrong order is a wrong recommendation at the moment someone is on the
 * clock.
 */
import { DraftAssistantService, emptyPrefs, BoardPrefs } from './draft-assistant.service'
import { MapValueBook, LeagueFormat } from '../models/value-book.model'
import { DraftPick } from '../models/draft.interface'

const FORMAT: LeagueFormat = {
  fingerprint: { isDynasty: true, numQbs: 1, numTeams: 12, ppr: 1 },
  clamps: [],
  unsupportedReasons: [],
  approximations: [],
  isKeeper: false,
  teBonus: 0,
  scoringSettings: { rec: 1 },
  rosterPositions: ['QB', 'RB', 'WR', 'TE'],
  leagueId: 'league-1',
  maxKeepers: 0,
  startingSlots: 4,
}

const PLAYERS = {
  rb1: { first_name: 'Best', last_name: 'Back', position: 'RB' },
  wr1: { first_name: 'Top', last_name: 'Receiver', position: 'WR' },
  qb1: { first_name: 'Good', last_name: 'Passer', position: 'QB' },
  te1: { first_name: 'Some', last_name: 'End', position: 'TE' },
  k1: { first_name: 'A', last_name: 'Kicker', position: 'K' },
  unpriced: { first_name: 'No', last_name: 'Value', position: 'WR' },
}

function book() {
  // `unpriced` and `k1` deliberately absent from the value map.
  return new MapValueBook(
    FORMAT,
    new Map([
      ['rb1', 9000],
      ['wr1', 8800],
      ['qb1', 8000],
      ['te1', 4000],
    ]),
    new Map([
      ['rb1', 'RB'],
      ['wr1', 'WR'],
      ['qb1', 'QB'],
      ['te1', 'TE'],
    ]),
    new Map(),
    new Map(),
    Date.now(),
  )
}

function pick(playerId: string, pickedBy: string, no = 1): DraftPick {
  return { player_id: playerId, picked_by: pickedBy, pick_no: no } as DraftPick
}

function prefs(overrides: Partial<BoardPrefs> = {}): BoardPrefs {
  return { ...emptyPrefs(), ...overrides }
}

describe('DraftAssistantService', () => {
  let service: DraftAssistantService

  beforeEach(() => (service = new DraftAssistantService()))

  it('ranks by raw value under best-available', () => {
    const board = service.suggest([], PLAYERS, book(), prefs(), 'me')

    expect(board.map((c) => c.playerId)).toEqual(['rb1', 'wr1', 'qb1', 'te1'])
  })

  it('removes players already drafted', () => {
    const board = service.suggest([pick('rb1', 'someone')], PLAYERS, book(), prefs(), 'me')

    expect(board.map((c) => c.playerId)).not.toContain('rb1')
  })

  it('ignores picks that have not resolved to a player', () => {
    const unresolved = { player_id: '', picked_by: 'x', pick_no: 1 } as DraftPick

    const board = service.suggest([unresolved], PLAYERS, book(), prefs(), 'me')

    // An empty player_id is a pick still on the clock, not a taken player.
    expect(board.length).toBe(4)
  })

  it('skips positions nobody drafts off a value board', () => {
    const board = service.suggest([], PLAYERS, book(), prefs(), 'me')

    expect(board.map((c) => c.playerId)).not.toContain('k1')
  })

  it('skips players this league cannot price', () => {
    const board = service.suggest([], PLAYERS, book(), prefs(), 'me')

    // An unknown value is not a zero-value player. Guessing would rank
    // someone the source simply does not cover.
    expect(board.map((c) => c.playerId)).not.toContain('unpriced')
  })

  it('lifts the weighted position under a positional preset', () => {
    const bpa = service.suggest([], PLAYERS, book(), prefs({ preset: 'qb-early' }), 'me')

    // qb1 is worth less than rb1 and wr1 raw; the preset is what moves it.
    expect(bpa[0].playerId).toBe('qb1')
    expect(bpa[0].reason).toBe('QB early')
  })

  it('leaves the order alone for positions a preset does not weight', () => {
    const board = service.suggest([], PLAYERS, book(), prefs({ preset: 'rb-heavy' }), 'me')

    expect(board[0].playerId).toBe('rb1')
    // Roster awareness applies to every preset now, not only "fill my
    // needs" -- a board that ignores your roster is a ranking, not a
    // recommendation.
    expect(board.find((c) => c.playerId === 'wr1')?.reason).toBe('No WR yet')
  })

  it('counts only my own picks when working out needs', () => {
    const picks = [pick('rb1', 'someone-else'), pick('wr1', 'me')]

    const counts = service.positionCounts(picks, PLAYERS, 'me')

    expect(counts).toEqual({ WR: 1 })
  })

  it('weights positions I am short of under the needs preset', () => {
    const board = service.suggest([], PLAYERS, book(), prefs({ preset: 'needs' }), 'me')

    expect(board[0].reason).toBe('No RB yet')
  })

  it('stops weighting a position once I have enough', () => {
    // Target for TE is 2; take two so it is no longer a need.
    const picks = [pick('te1', 'me', 1), pick('other-te', 'me', 2)]
    const withTe = { ...PLAYERS, 'other-te': { position: 'TE' } }

    const board = service.suggest(picks, withTe, book(), prefs({ preset: 'needs' }), 'me')
    const te = board.find((c) => c.position === 'TE')

    expect(te).toBeUndefined() // te1 is drafted; nothing else at TE is priced
    expect(service.positionCounts(picks, withTe, 'me')['TE']).toBe(2)
  })

  it('floats a liked player above everyone', () => {
    const board = service.suggest(
      [],
      PLAYERS,
      book(),
      prefs({ likes: new Set(['te1']) }),
      'me',
    )

    // te1 is the cheapest player on the board. The user's own read wins.
    expect(board[0].playerId).toBe('te1')
    expect(board[0].reason).toBe('On your list')
  })

  it('buries a disliked player below everyone', () => {
    const board = service.suggest(
      [],
      PLAYERS,
      book(),
      prefs({ dislikes: new Set(['rb1']) }),
      'me',
    )

    expect(board[board.length - 1].playerId).toBe('rb1')
    expect(board[board.length - 1].reason).toBe('Buried by you')
  })

  it('lets a like beat a dislike-free preset', () => {
    const board = service.suggest(
      [],
      PLAYERS,
      book(),
      prefs({ preset: 'qb-early', likes: new Set(['te1']) }),
      'me',
    )

    expect(board[0].playerId).toBe('te1')
  })

  it('caps the board', () => {
    const board = service.suggest([], PLAYERS, book(), prefs(), 'me', 2)

    // A draft pool is thousands deep and nobody scrolls it mid-pick.
    expect(board.length).toBe(2)
  })

  it('carries the raw value alongside the weighted score', () => {
    const board = service.suggest([], PLAYERS, book(), prefs({ preset: 'qb-early' }), 'me')
    const qb = board.find((c) => c.playerId === 'qb1')!

    // The user sees what the player is actually worth, not just our number.
    expect(qb.value).toBe(8000)
    expect(qb.score).toBeGreaterThan(qb.value)
  })

  it('works with no signed-in user', () => {
    const board = service.suggest([], PLAYERS, book(), prefs({ preset: 'needs' }), null)

    // Guest viewing a draft: no needs to compute, but the board still ranks.
    expect(board.length).toBe(4)
  })
})

/**
 * Reported live: "why does it show best available and its players that arent
 * available in my dynasty league".
 *
 * The board excluded only players drafted in THIS draft. In a dynasty league
 * almost nobody in the pool is free -- they were drafted in an earlier season
 * and kept, so they never appear in this draft's picks.
 */
describe('DraftAssistantService availability in a keeper league', () => {
  const service = new DraftAssistantService()

  const playerMap = {
    p1: { position: 'RB', first_name: 'A', last_name: 'One' },
    p2: { position: 'WR', first_name: 'B', last_name: 'Two' },
    p3: { position: 'QB', first_name: 'C', last_name: 'Three' },
  } as never

  const book = {
    playerIds: ['p1', 'p2', 'p3'],
    value: (id: string) => ({ known: true, value: { p1: 30, p2: 20, p3: 10 }[id] ?? 0 }),
    position: (id: string) => ({ p1: 'RB', p2: 'WR', p3: 'QB' }[id] ?? ''),
  } as never

  const prefs = { preset: 'bpa', likes: new Set<string>(), dislikes: new Set<string>() } as never

  it('collects every rostered player id', () => {
    const ids = service.rosteredIds([
      { players: ['p1', 'p2'] },
      { players: ['p3'] },
    ])

    expect([...ids].sort()).toEqual(['p1', 'p2', 'p3'])
  })

  it('survives a roster with no players', () => {
    expect(service.rosteredIds([{ players: null }, {}]).size).toBe(0)
  })

  it('leaves rostered players off the board', () => {
    const rostered = service.rosteredIds([{ players: ['p1'] }])

    const board = service.suggest([], playerMap, book, prefs, null, 25, rostered)

    // p1 is the highest value in the book and would otherwise lead the board
    // while sitting on someone's dynasty roster.
    expect(board.map((c) => c.playerId)).toEqual(['p2', 'p3'])
  })

  it('still excludes players drafted in this draft', () => {
    const picks = [{ player_id: 'p2' }] as never

    const board = service.suggest(picks, playerMap, book, prefs, null, 25, new Set())

    expect(board.map((c) => c.playerId)).toEqual(['p1', 'p3'])
  })

  it('excludes both sources at once', () => {
    const picks = [{ player_id: 'p2' }] as never
    const rostered = service.rosteredIds([{ players: ['p1'] }])

    const board = service.suggest(picks, playerMap, book, prefs, null, 25, rostered)

    expect(board.map((c) => c.playerId)).toEqual(['p3'])
  })

  it('offers everyone in a startup draft, where nobody is rostered yet', () => {
    const board = service.suggest([], playerMap, book, prefs, null, 25, new Set())

    expect(board.map((c) => c.playerId)).toEqual(['p1', 'p2', 'p3'])
  })
})

/**
 * "it also kept recommending qbs when i already had one. thats not helpful."
 *
 * Two independent causes: TARGET_COUNTS hardcoded two QBs regardless of the
 * lineup, and only the "needs" preset applied any positional weighting at
 * all, so the default board was roster-blind.
 *
 * The fix is the standard one -- value over replacement, where replacement is
 * the best player left once every team has filled its starting slots.
 */
import { leagueShape } from './draft-assistant.service'

describe('leagueShape', () => {
  it('counts the starters a league actually uses', () => {
    const shape = leagueShape(['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'BN', 'BN'], 12)

    expect(shape.starters['QB']).toBe(1)
    expect(shape.starters['RB']).toBe(2)
    expect(shape.teams).toBe(12)
  })

  it('ignores bench, IR and taxi slots', () => {
    const shape = leagueShape(['QB', 'BN', 'BN', 'IR', 'TAXI'], 10)

    expect(shape.starters['QB']).toBe(1)
    expect(shape.starters['RB']).toBe(0)
  })

  it('shares a flex across the positions that can fill it', () => {
    const shape = leagueShape(['FLEX'], 12)

    // One flex is a third of an RB, WR and TE slot each -- which is how it
    // moves replacement level.
    expect(shape.starters['RB']).toBeCloseTo(1 / 3)
    expect(shape.starters['WR']).toBeCloseTo(1 / 3)
    expect(shape.starters['QB']).toBe(0)
  })

  it('gives superflex a share of QB', () => {
    const shape = leagueShape(['SUPER_FLEX'], 12)

    // The whole reason superflex prices quarterbacks differently.
    expect(shape.starters['QB']).toBeGreaterThan(0)
  })

  it('survives a league with no roster positions', () => {
    const shape = leagueShape(null, 12)

    expect(shape.starters['QB']).toBe(0)
    expect(shape.teams).toBe(12)
  })

  it('never reports zero teams', () => {
    expect(leagueShape(['QB'], 0).teams).toBe(1)
  })

  it('handles the real CLIT lineup', () => {
    const shape = leagueShape(
      ['QB','RB','RB','WR','WR','TE','FLEX','FLEX','K','DEF','BN','BN','BN','BN','BN','BN'],
      12,
    )

    // One QB started, so the second quarterback is a bench player.
    expect(shape.starters['QB']).toBe(1)
    expect(shape.starters['RB']).toBeCloseTo(2 + 2 / 3)
  })
})

describe('DraftAssistantService roster awareness', () => {
  const ONE_QB = leagueShape(['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX'], 12)

  /** A pool deep enough for replacement level to mean something. */
  function deepBook() {
    const ids: string[] = []
    const values: Record<string, number> = {}
    const positions: Record<string, string> = {}
    for (const [pos, top] of [['QB', 100], ['RB', 96], ['WR', 94], ['TE', 80]] as const) {
      for (let i = 1; i <= 40; i++) {
        const id = `${pos}${i}`
        ids.push(id)
        // QBs stay bunched, the rest fall away -- the actual shape of the
        // positions, and the whole reason replacement level differs.
        values[id] = pos === 'QB' ? top - i * 1.2 : top - i * 1.9
        positions[id] = pos
      }
    }
    return {
      playerIds: ids,
      value: (id: string) => ({ known: values[id] !== undefined, value: values[id] ?? 0 }),
      position: (id: string) => positions[id],
    }
  }

  function meta() {
    const out: Record<string, { position: string; first_name: string; last_name: string }> = {}
    for (const [pos] of [['QB'], ['RB'], ['WR'], ['TE']] as const) {
      for (let i = 1; i <= 40; i++) {
        out[`${pos}${i}`] = { position: pos, first_name: pos, last_name: String(i) }
      }
    }
    return out
  }

  function pick(playerId: string, userId: string) {
    return { player_id: playerId, picked_by: userId } as never
  }

  const prefs = { preset: 'bpa' as const, likes: new Set<string>(), dislikes: new Set<string>() }
  let service: DraftAssistantService

  beforeEach(() => (service = new DraftAssistantService()))

  it('stops pushing QBs once the one starting slot is filled', () => {
    const board = service.suggest(
      [pick('QB1', 'me')] as never,
      meta() as never,
      deepBook() as never,
      prefs,
      'me',
      10,
      new Set(),
      ONE_QB,
    )

    // The exact complaint: one QB rostered in a one-QB league, and the board
    // kept leading with another.
    expect(board[0].position).not.toBe('QB')
  })

  it('says why a filled position dropped', () => {
    const board = service.suggest(
      [pick('QB1', 'me')] as never,
      meta() as never,
      deepBook() as never,
      prefs,
      'me',
      160,
      new Set(),
      ONE_QB,
    )

    expect(board.find((c) => c.position === 'QB')?.reason).toBe('QB done')
  })

  it('still recommends a QB when you have none', () => {
    const board = service.suggest([], meta() as never, deepBook() as never, prefs, 'me', 160, new Set(), ONE_QB)

    expect(board.some((c) => c.position === 'QB')).toBe(true)
  })

  it('ranks a second QB below anything you would start', () => {
    const board = service.suggest(
      [pick('QB1', 'me')] as never,
      meta() as never,
      deepBook() as never,
      prefs,
      'me',
      160,
      new Set(),
      ONE_QB,
    )
    const bestQb = board.find((c) => c.position === 'QB')!
    // Startable means worth more than the last man your league starts at his
    // position; below that you are choosing between waiver bodies.
    const startable = board.filter((c) => c.position !== 'QB' && c.surplus > 0)

    // "2nd qb shouldnt outrank anythign really. maybe defense or kciker"
    expect(startable.length).toBeGreaterThan(20)
    expect(bestQb.score).toBeLessThan(Math.min(...startable.map((c) => c.score)))
  })

  it('does not bury a position entirely', () => {
    const board = service.suggest(
      [pick('QB1', 'me')] as never,
      meta() as never,
      deepBook() as never,
      prefs,
      'me',
      160,
      new Set(),
      ONE_QB,
    )

    // Injuries happen and an elite one is still worth taking; "you have a QB"
    // must not become "never take a QB".
    expect(board.some((c) => c.position === 'QB')).toBe(true)
  })

  it('prices a bunched position below a scarce one', () => {
    const board = service.suggest([], meta() as never, deepBook() as never, prefs, 'me', 5, new Set(), ONE_QB)

    // QBs are bunched, so the best one is worth little over the twelfth. RBs
    // fall away, so the best one is worth a lot over his replacement.
    expect(board[0].position).not.toBe('QB')
  })

  it('reports surplus over replacement, not raw value', () => {
    const board = service.suggest([], meta() as never, deepBook() as never, prefs, 'me', 160, new Set(), ONE_QB)
    const qb = board.find((c) => c.position === 'QB')!

    expect(qb.surplus).toBeLessThan(qb.value)
  })

  it('counts only my own picks toward my roster', () => {
    const board = service.suggest(
      [pick('QB1', 'someone-else')] as never,
      meta() as never,
      deepBook() as never,
      prefs,
      'me',
      160,
      new Set(),
      ONE_QB,
    )

    expect(board.find((c) => c.position === 'QB')?.reason).toBe('No QB yet')
  })
})
