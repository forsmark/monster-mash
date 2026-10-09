import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FLAVOR_BY_ID, imageUrl } from '../flavors'
import { computeStandings, nextPair, progress, type Match } from '../ranking'
import type { SavedState } from '../storage'
import { Btn } from './Btn'

type Side = 'left' | 'right'
type Slot = { id: string; key: number }
type Exit = { reason: 'pick' | 'reroll' | 'exclude' | 'undo'; winner?: string }

type Props = {
  state: SavedState
  activeIds: string[]
  onChange: (next: SavedState) => void
  onRanking: () => void
  onHome: () => void
}

const SPLASHES = ['NICE!', 'TAKE IT!', 'CHOSEN!', 'BOOM!', 'GOT IT!', 'NO MERCY!']

let slotKey = 0
const toSlots = (pair: [string, string] | null): [Slot, Slot] | null =>
  pair && [
    { id: pair[0], key: ++slotKey },
    { id: pair[1], key: ++slotKey },
  ]

// Exit variants read the latest Exit through AnimatePresence `custom`, because
// an exiting card keeps the props of its last render.
function cardVariants(side: Side, id: string): Variants {
  const dir = side === 'left' ? -1 : 1
  return {
    initial: { x: `${dir * 130}%`, rotate: dir * 14, opacity: 0, scale: 0.9 },
    animate: {
      x: 0,
      rotate: dir * 2,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 380, damping: 26 },
    },
    exit: (exit: Exit) => {
      switch (exit.reason) {
        case 'pick':
          return exit.winner === id
            ? { y: -60, scale: 1.12, opacity: 0, transition: { duration: 0.32 } }
            : // The loser drops out of frame.
              { y: 420, rotate: dir * 28, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }
        case 'exclude':
          return {
            scale: 0.4,
            rotate: dir * 50,
            opacity: 0,
            filter: 'grayscale(1)',
            transition: { duration: 0.35 },
          }
        default:
          return { x: `${dir * 130}%`, rotate: dir * 20, opacity: 0, transition: { duration: 0.25 } }
      }
    },
  }
}

export function BattleScreen({ state, activeIds, onChange, onRanking, onHome }: Props) {
  const table = useMemo(() => computeStandings(activeIds, state.history), [activeIds, state.history])
  const [slots, setSlots] = useState(() => toSlots(nextPair(table, state.history)))
  const [exit, setExit] = useState<Exit>({ reason: 'reroll' })
  const [splash, setSplash] = useState<{ key: number; text: string } | null>(null)
  // Ignore input while the cards swap, so a double click does not count twice.
  const busy = useRef(false)

  const lock = () => {
    busy.current = true
    window.setTimeout(() => (busy.current = false), 380)
  }

  const pick = useCallback(
    (side: Side) => {
      if (!slots || busy.current) return
      lock()
      const [l, r] = slots
      const winner = side === 'left' ? l.id : r.id
      const match: Match = { a: l.id, b: r.id, winner }
      const history = [...state.history, match]
      const nextTable = computeStandings(activeIds, history)
      setExit({ reason: 'pick', winner })
      setSplash({ key: Date.now(), text: SPLASHES[history.length % SPLASHES.length] })
      setSlots(toSlots(nextPair(nextTable, history)))
      onChange({ ...state, history })
    },
    [slots, state, activeIds, onChange],
  )

  const reroll = useCallback(() => {
    if (!slots || busy.current) return
    lock()
    setExit({ reason: 'reroll' })
    setSlots(toSlots(nextPair(table, state.history, { avoid: [slots[0].id, slots[1].id] })))
  }, [slots, table, state.history])

  const exclude = useCallback(
    (side: Side) => {
      if (!slots || busy.current) return
      lock()
      const gone = side === 'left' ? slots[0] : slots[1]
      const kept = side === 'left' ? slots[1] : slots[0]
      const excluded = [...state.excluded, gone.id]
      const ids = activeIds.filter((id) => id !== gone.id)
      const pair = nextPair(computeStandings(ids, state.history), state.history, { keep: kept.id })
      setExit({ reason: 'exclude' })
      if (pair) {
        const fresh = { id: pair[1], key: ++slotKey }
        setSlots(side === 'left' ? [fresh, kept] : [kept, fresh])
      } else {
        setSlots(null)
      }
      onChange({ ...state, excluded })
    },
    [slots, state, activeIds, onChange],
  )

  const undo = useCallback(() => {
    const last = state.history.at(-1)
    if (!last || busy.current) return
    lock()
    const history = state.history.slice(0, -1)
    setExit({ reason: 'undo' })
    const bothActive = activeIds.includes(last.a) && activeIds.includes(last.b)
    setSlots(
      bothActive
        ? toSlots([last.a, last.b])
        : toSlots(nextPair(computeStandings(activeIds, history), history)),
    )
    onChange({ ...state, history })
  }, [state, activeIds, onChange])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowLeft') pick('left')
      else if (e.key === 'ArrowRight') pick('right')
      else if (e.key === 'r' || e.key === 'R') reroll()
      else if (e.key === 'z' || e.key === 'Z') undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pick, reroll, undo])

  const pct = Math.round(progress(table) * 100)

  return (
    <div className="screen battle-screen">
      <header className="battle-top">
        <Btn className="btn btn-small btn-ghost" onClick={onHome}>
          Home
        </Btn>
        <div className="round">
          <span className="round-label">Round</span>
          <motion.span
            key={state.history.length}
            className="round-num"
            initial={{ scale: 2, rotate: -12 }}
            animate={{ scale: 1, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          >
            {state.history.length + 1}
          </motion.span>
        </div>
        <Btn className="btn btn-small" onClick={onRanking}>
          Ranking
        </Btn>
      </header>

      <div className="meter" title={`${pct}% of the way to a settled ranking`}>
        <motion.div className="meter-fill" animate={{ width: `${pct}%` }} />
        <span className="meter-text">{pct >= 100 ? 'Ranking settled. Keep going for more precision.' : `Ranking ${pct}% settled`}</span>
      </div>

      {slots ? (
        <div className="arena">
          {(['left', 'right'] as const).map((side, i) => {
            const slot = slots[i]
            return (
              <div key={side} className={`slot slot-${side}`}>
                <AnimatePresence custom={exit}>
                  <FlavorCard
                    key={slot.key}
                    id={slot.id}
                    side={side}
                    onPick={() => pick(side)}
                    onExclude={() => exclude(side)}
                  />
                </AnimatePresence>
              </div>
            )
          })}
          <motion.div
            key={`${slots[0].key}-${slots[1].key}`}
            className="vs"
            aria-hidden
            initial={{ scale: 3, rotate: -120, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 16, delay: 0.12 }}
          >
            <motion.span
              animate={{ scale: [1, 1.14, 1], rotate: [-12, -4, -12] }}
              transition={{ duration: 1.1, ease: 'easeInOut', repeat: Infinity }}
            >
              VS
            </motion.span>
          </motion.div>
        </div>
      ) : (
        <div className="panel empty-panel">
          <p>Fewer than two flavors are left in play.</p>
          <Btn className="btn" onClick={onRanking}>
            See ranking
          </Btn>
        </div>
      )}

      <footer className="battle-controls">
        <Btn className="btn btn-ghost" onClick={undo} disabled={!state.history.length}>
          Undo <kbd>Z</kbd>
        </Btn>
        <Btn className="btn" onClick={reroll} disabled={!slots}>
          Reroll <kbd>R</kbd>
        </Btn>
      </footer>
      <p className="hint">Tap a can to pick it, or use the arrow keys.</p>

      <AnimatePresence>
        {splash && (
          <motion.div
            key={splash.key}
            className="splash"
            initial={{ x: '-110%', skewX: -25 }}
            animate={{ x: '0%', skewX: -12, transition: { type: 'spring', stiffness: 700, damping: 30 } }}
            exit={{ x: '110%', skewX: -25, transition: { duration: 0.2 } }}
            onAnimationComplete={() => window.setTimeout(() => setSplash((s) => (s?.key === splash.key ? null : s)), 250)}
            aria-hidden
          >
            <span>{splash.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type CardProps = {
  id: string
  side: Side
  onPick: () => void
  onExclude: () => void
}

function FlavorCard({ id, side, onPick, onExclude }: CardProps) {
  const flavor = FLAVOR_BY_ID.get(id)!
  const variants = useMemo(() => cardVariants(side, id), [side, id])
  return (
    <motion.div
      className={`card line-${flavor.lineKey}`}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.button
        type="button"
        className="card-pick"
        onClick={onPick}
        aria-label={`Pick ${flavor.name}`}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        whileTap="tap"
        variants={{
          rest: { scale: 1, rotate: 0 },
          hover: { scale: 1.04, rotate: side === 'left' ? -1.5 : 1.5 },
          tap: { scale: 0.94 },
        }}
      >
        <span className="card-shard" aria-hidden />
        <motion.img
          className="card-can"
          src={imageUrl(flavor)}
          alt=""
          draggable={false}
          variants={{
            rest: { rotate: 0, y: 0 },
            hover: { rotate: side === 'left' ? -6 : 6, y: -8 },
            tap: { rotate: 0, y: 4 },
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        />
        <span className="card-line">{flavor.line}</span>
        <span className="card-name">{flavor.name}</span>
      </motion.button>
      <motion.button
        type="button"
        className="btn-never"
        onClick={onExclude}
        style={{ skewX: -10 }}
        whileHover={{ scale: 1.06, rotate: side === 'left' ? -2 : 2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 600, damping: 18 }}
      >
        I've never tried this flavor
      </motion.button>
    </motion.div>
  )
}
