import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { FLAVOR_BY_ID, imageUrl } from '../flavors'
import { computeStandings, progress, rank } from '../ranking'
import type { SavedState } from '../storage'
import { Btn } from './Btn'
import { RansomText } from './RansomText'

type Props = {
  state: SavedState
  activeIds: string[]
  onChange: (next: SavedState) => void
  onBattle: () => void
  onHome: () => void
  onReset: () => void
}

export function RankingScreen({ state, activeIds, onChange, onBattle, onHome, onReset }: Props) {
  const table = useMemo(() => computeStandings(activeIds, state.history), [activeIds, state.history])
  // Only flavors the visitor has judged in a pick are ranked. Flavors that have
  // not come up yet may be untried, so they stay out of the list.
  const all = useMemo(() => rank(table), [table])
  const rows = all.filter((r) => r.wins + r.losses > 0)
  const unranked = all.length - rows.length
  const pct = Math.round(progress(table) * 100)
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const copy = async () => {
    const text = rows
      .slice(0, 10)
      .map((r, i) => `${i + 1}. ${FLAVOR_BY_ID.get(r.id)!.name}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(`My Monster ranking\n${text}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be blocked. The button then does nothing.
    }
  }

  // The first paint staggers the rows in. Later changes animate at once.
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 900)
    return () => window.clearTimeout(t)
  }, [])

  // The row leaves the ranking and the rows below move up to take its place.
  const exclude = (id: string) => onChange({ ...state, excluded: [...state.excluded, id] })

  const restore = (id: string) =>
    onChange({ ...state, excluded: state.excluded.filter((x) => x !== id) })

  return (
    <div className="screen ranking-screen">
      <RansomText text="YOUR RANKING" seed={7} className="title-mid" />
      <p className="ranking-sub">
        {state.history.length} picks · {pct >= 100 ? 'settled' : `${pct}% settled`}
      </p>

      <div className="ranking-actions">
        <Btn className="btn" onClick={onBattle} disabled={activeIds.length < 2}>
          Keep picking
        </Btn>
        <Btn className="btn btn-ghost" onClick={copy} disabled={!rows.length}>
          {copied ? 'Copied!' : 'Copy top 10'}
        </Btn>
        <Btn className="btn btn-ghost" onClick={onHome}>
          Home
        </Btn>
      </div>

      {rows.length === 0 ? (
        <div className="panel empty-panel">
          <p>No picks yet. Start a round to build your ranking.</p>
        </div>
      ) : (
        <ol className="ranking-list">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((r, i) => {
              const f = FLAVOR_BY_ID.get(r.id)!
              return (
                <motion.li
                  key={r.id}
                  layout
                  className={`rank-row line-${f.lineKey} ${i < 3 ? `top top-${i + 1}` : ''}`}
                  style={{ skewX: -8 }}
                  initial={{ x: i % 2 ? 300 : -300, opacity: 0, skewX: -20 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    skewX: -8,
                    transition: {
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                      delay: entered ? 0 : Math.min(i, 20) * 0.03,
                    },
                  }}
                  exit={{
                    x: 420,
                    opacity: 0,
                    skewX: -30,
                    rotate: 4,
                    transition: { duration: 0.3, ease: 'easeIn' },
                  }}
                  transition={{ layout: { type: 'spring', stiffness: 500, damping: 38 } }}
                >
                  <motion.span
                    key={i}
                    className="rank-num"
                    style={{ skewX: 8 }}
                    initial={entered ? { scale: 1.8, rotate: -15 } : false}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 16 }}
                  >
                    {i + 1}
                  </motion.span>
                  <img className="rank-can" src={imageUrl(f)} alt="" loading="lazy" />
                  <span className="rank-info">
                    <span className="rank-name">{f.name}</span>
                    <span className="rank-line">{f.line}</span>
                  </span>
                  <span className="rank-record" title={`Rating ${Math.round(r.rating)}`}>
                    {r.wins}–{r.losses}
                  </span>
                  <motion.button
                    type="button"
                    className="rank-exclude"
                    style={{ skewX: 8 }}
                    onClick={() => exclude(r.id)}
                    aria-label={`I've never tried ${f.name}. Remove it from the ranking.`}
                    title="I've never tried this flavor"
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 16 }}
                  >
                    <span aria-hidden>✕</span>
                    <span className="rank-exclude-text">Never tried</span>
                  </motion.button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      )}

      <AnimatePresence>
        {rows.length > 0 && unranked > 0 && (
          <motion.p
            key="unranked"
            layout
            className="unranked-note"
            style={{ skewX: -10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {unranked} {unranked === 1 ? 'flavor has' : 'flavors have'} not come up yet. Keep picking to rank{' '}
            {unranked === 1 ? 'it' : 'them'}.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.excluded.length > 0 && (
          <motion.section
            key="never"
            layout
            className="panel never-panel"
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            exit={{ opacity: 0, y: 40, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <h2 className="panel-label">Never tried</h2>
            <ul className="never-list">
              <AnimatePresence initial={false} mode="popLayout">
                {state.excluded.map((id) => {
                  const f = FLAVOR_BY_ID.get(id)
                  if (!f) return null
                  return (
                    <motion.li
                      key={id}
                      layout
                      style={{ skewX: -10 }}
                      initial={{ scale: 0, rotate: -25 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 25, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <span>{f.name}</span>
                      <motion.button
                        type="button"
                        className="btn-restore"
                        onClick={() => restore(id)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Put back
                      </motion.button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="reset-zone">
        {confirmReset ? (
          <motion.div
            className="reset-confirm"
            initial={{ opacity: 0, scale: 0.7, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <span>Delete all picks and exclusions?</span>
            <Btn className="btn btn-danger" onClick={onReset}>
              Yes, reset
            </Btn>
            <Btn className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Btn>
          </motion.div>
        ) : (
          <motion.button
            type="button"
            className="btn-link"
            onClick={() => setConfirmReset(true)}
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.92 }}
          >
            Reset everything
          </motion.button>
        )}
      </div>
    </div>
  )
}
