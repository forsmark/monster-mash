import type { Match } from './ranking'
import type { LineKey } from './flavors'

export type SavedState = {
  history: Match[]
  /** Flavors the visitor has never tried. */
  excluded: string[]
  /** Product lines the visitor switched off on the title screen. */
  disabledLines: LineKey[]
}

const KEY = 'monster-mash:v1'

export const EMPTY_STATE: SavedState = { history: [], excluded: [], disabledLines: [] }

export function load(): SavedState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<SavedState>
    return {
      history: Array.isArray(parsed.history) ? parsed.history : [],
      excluded: Array.isArray(parsed.excluded) ? parsed.excluded : [],
      disabledLines: Array.isArray(parsed.disabledLines) ? parsed.disabledLines : [],
    }
  } catch {
    return EMPTY_STATE
  }
}

export function save(state: SavedState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage can be full or blocked. The session still works in memory.
  }
}
