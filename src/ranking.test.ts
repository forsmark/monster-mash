import { describe, expect, it } from 'vitest'
import { computeStandings, nextPair, rank, type Match } from './ranking'

const ids = ['a', 'b', 'c', 'd']

describe('computeStandings', () => {
  it('ranks a flavor that always wins first', () => {
    const history: Match[] = [
      { a: 'a', b: 'b', winner: 'a' },
      { a: 'a', b: 'c', winner: 'a' },
      { a: 'b', b: 'c', winner: 'b' },
    ]
    const order = rank(computeStandings(ids, history)).map((s) => s.id)
    expect(order[0]).toBe('a')
    expect(order.at(-1)).toBe('c')
  })

  it('ignores matches with excluded flavors', () => {
    const table = computeStandings(['a', 'c'], [{ a: 'a', b: 'b', winner: 'a' }])
    expect(table.get('a')!.wins).toBe(0)
    expect(table.has('b')).toBe(false)
  })
})

describe('nextPair', () => {
  it('returns two different active flavors', () => {
    for (let i = 0; i < 50; i++) {
      const pair = nextPair(computeStandings(ids, []), [])!
      expect(pair[0]).not.toBe(pair[1])
      expect(ids).toContain(pair[0])
      expect(ids).toContain(pair[1])
    }
  })

  it('returns null with fewer than two flavors', () => {
    expect(nextPair(computeStandings(['a'], []), [])).toBeNull()
  })

  it('avoids the current pair on a reroll', () => {
    for (let i = 0; i < 50; i++) {
      const pair = nextPair(computeStandings(ids, []), [], { avoid: ['a', 'b'] })!
      expect(pair.sort()).toEqual(['c', 'd'])
    }
  })

  it('keeps the given flavor in the left slot', () => {
    for (let i = 0; i < 50; i++) {
      const pair = nextPair(computeStandings(ids, []), [], { keep: 'c' })!
      expect(pair[0]).toBe('c')
      expect(pair[1]).not.toBe('c')
    }
  })

  it('prefers flavors with fewer matches', () => {
    const history: Match[] = [{ a: 'a', b: 'b', winner: 'a' }]
    for (let i = 0; i < 50; i++) {
      const pair = nextPair(computeStandings(ids, history), history)!
      expect(pair.some((id) => id === 'c' || id === 'd')).toBe(true)
    }
  })
})
