export type Match = { a: string; b: string; winner: string }

export type Standing = {
  id: string
  rating: number
  wins: number
  losses: number
}

const START_RATING = 1000
const K = 32

export function computeStandings(ids: string[], history: Match[]): Map<string, Standing> {
  const table = new Map<string, Standing>()
  for (const id of ids) table.set(id, { id, rating: START_RATING, wins: 0, losses: 0 })

  for (const m of history) {
    const a = table.get(m.a)
    const b = table.get(m.b)
    // Skip matches against flavors that are no longer in play.
    if (!a || !b) continue
    const expectedA = 1 / (1 + 10 ** ((b.rating - a.rating) / 400))
    const scoreA = m.winner === m.a ? 1 : 0
    a.rating += K * (scoreA - expectedA)
    b.rating -= K * (scoreA - expectedA)
    const [w, l] = scoreA ? [a, b] : [b, a]
    w.wins++
    l.losses++
  }
  return table
}

export function rank(table: Map<string, Standing>): Standing[] {
  return [...table.values()].sort(
    (x, y) => y.rating - x.rating || y.wins - x.wins || x.losses - y.losses,
  )
}

const played = (s: Standing) => s.wins + s.losses

type PairOptions = {
  /** The current pair on a reroll. The new pair avoids these flavors when it can. */
  avoid?: string[]
  /** A flavor that stays in the pair, for example after the other one is excluded. */
  keep?: string
  random?: () => number
}

/**
 * Picks the next pair. The first pick is a flavor with the fewest matches, so
 * every flavor gets play. The opponent is a close rating it has not met yet,
 * with jitter so the pairings do not repeat.
 */
export function nextPair(
  table: Map<string, Standing>,
  history: Match[],
  { avoid = [], keep, random = Math.random }: PairOptions = {},
): [string, string] | null {
  const pool = [...table.values()]
  if (pool.length < 2) return null

  let first = keep ? table.get(keep) : undefined
  if (!first) {
    const fresh = pool.filter((s) => !avoid.includes(s.id))
    const firstPool = fresh.length ? fresh : pool
    const fewest = Math.min(...firstPool.map(played))
    const lowest = firstPool.filter((s) => played(s) === fewest)
    first = lowest[Math.floor(random() * lowest.length)]
  }
  const firstId = first.id

  const met = new Set<string>()
  for (const m of history) {
    if (m.a === firstId) met.add(m.b)
    if (m.b === firstId) met.add(m.a)
  }
  const others = pool.filter((s) => s.id !== firstId)
  const unmet = others.filter((s) => !met.has(s.id))
  let candidates = unmet.length ? unmet : others
  const notAvoided = candidates.filter((s) => !avoid.includes(s.id))
  if (notAvoided.length) candidates = notAvoided

  let best = candidates[0]
  let bestScore = Infinity
  for (const s of candidates) {
    const score = Math.abs(s.rating - first.rating) + played(s) * 8 + random() * 120
    if (score < bestScore) {
      best = s
      bestScore = score
    }
  }
  if (keep) return [firstId, best.id]
  return random() < 0.5 ? [firstId, best.id] : [best.id, firstId]
}

/** Matches per flavor before the ranking counts as settled. */
export const MATCHES_PER_FLAVOR = 4

export function progress(table: Map<string, Standing>): number {
  const pool = [...table.values()]
  if (!pool.length) return 1
  const done = pool.reduce((sum, s) => sum + Math.min(played(s), MATCHES_PER_FLAVOR), 0)
  return done / (pool.length * MATCHES_PER_FLAVOR)
}
