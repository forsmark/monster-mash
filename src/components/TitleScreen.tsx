import { motion } from 'motion/react'
import { FLAVORS, LINES, type LineKey } from '../flavors'
import { Btn } from './Btn'
import { RansomText } from './RansomText'

type Props = {
  disabledLines: LineKey[]
  excludedCount: number
  activeCount: number
  matchCount: number
  onToggleLine: (key: LineKey) => void
  onStart: () => void
  onRanking: () => void
}

export function TitleScreen({
  disabledLines,
  excludedCount,
  activeCount,
  matchCount,
  onToggleLine,
  onStart,
  onRanking,
}: Props) {
  return (
    <div className="screen title-screen">
      <RansomText text="MONSTER" seed={3} className="title-big" />
      <RansomText text="MASH" seed={11} className="title-big title-mash" />

      <motion.p
        className="tagline"
        initial={{ x: -400, skewX: -20, opacity: 0 }}
        animate={{ x: 0, skewX: -12, opacity: 1 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 24 }}
      >
        Two cans enter. One gets your vote.
      </motion.p>

      <motion.section
        className="panel lines-panel"
        initial={{ y: 60, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 22 }}
      >
        <h2 className="panel-label">Lineup</h2>
        <div className="line-chips">
          {LINES.map((line) => {
            const on = !disabledLines.includes(line.key)
            const count = FLAVORS.filter((f) => f.lineKey === line.key).length
            return (
              <motion.button
                key={line.key}
                type="button"
                className={`chip line-${line.key} ${on ? 'is-on' : ''}`}
                aria-pressed={on}
                onClick={() => onToggleLine(line.key)}
                style={{ skewX: -12 }}
                animate={{ scale: on ? 1 : 0.92, rotate: on ? 0 : -2 }}
                whileHover={{ y: -3, rotate: 1 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 600, damping: 18 }}
              >
                <span className="chip-name">{line.name}</span>
                <motion.span
                  key={String(on)}
                  className="chip-count"
                  initial={{ scale: 1.8, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 700, damping: 15 }}
                >
                  {count}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
        <p className="lines-note">
          <motion.span
            key={activeCount}
            className="lines-count"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 20 }}
          >
            {activeCount}
          </motion.span>{' '}
          flavors in play
          {excludedCount > 0 && ` · ${excludedCount} marked never tried`}
        </p>
      </motion.section>

      <motion.div
        className="title-actions"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 400, damping: 18 }}
      >
        <Btn className="btn btn-big" onClick={onStart} disabled={activeCount < 2}>
          {matchCount > 0 ? 'Continue' : 'Start'}
        </Btn>
        {matchCount > 0 && (
          <Btn className="btn btn-ghost" onClick={onRanking}>
            My ranking
          </Btn>
        )}
      </motion.div>
    </div>
  )
}
