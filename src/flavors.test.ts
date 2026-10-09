import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FLAVORS } from './flavors'

describe('flavor data', () => {
  it('has a can image on disk for every flavor', () => {
    const missing = FLAVORS.filter((f) => !existsSync(`public/${f.image}`)).map((f) => f.id)
    expect(missing).toEqual([])
  })

  it('has unique ids and names', () => {
    expect(new Set(FLAVORS.map((f) => f.id)).size).toBe(FLAVORS.length)
    expect(new Set(FLAVORS.map((f) => f.name)).size).toBe(FLAVORS.length)
  })
})
