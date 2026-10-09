import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Background } from './components/Background'
import { BattleScreen } from './components/BattleScreen'
import { RankingScreen } from './components/RankingScreen'
import { TitleScreen } from './components/TitleScreen'
import { FLAVORS, type LineKey } from './flavors'
import { EMPTY_STATE, load, save, type SavedState } from './storage'

type Screen = 'title' | 'battle' | 'ranking'

export default function App() {
  const [state, setState] = useState<SavedState>(load)
  const [screen, setScreen] = useState<Screen>('title')

  useEffect(() => save(state), [state])

  const activeIds = useMemo(
    () =>
      FLAVORS.filter(
        (f) => !state.excluded.includes(f.id) && !state.disabledLines.includes(f.lineKey),
      ).map((f) => f.id),
    [state.excluded, state.disabledLines],
  )

  const toggleLine = (key: LineKey) =>
    setState((s) => ({
      ...s,
      disabledLines: s.disabledLines.includes(key)
        ? s.disabledLines.filter((k) => k !== key)
        : [...s.disabledLines, key],
    }))

  return (
    <MotionConfig reducedMotion="user">
      <Background />
      <AnimatePresence mode="wait">
        <motion.main
          key={screen}
          className="stage"
          initial={{ opacity: 0, x: 80, skewX: -6 }}
          animate={{ opacity: 1, x: 0, skewX: 0, transition: { duration: 0.28, ease: 'easeOut' } }}
          exit={{ opacity: 0, x: -80, skewX: 6, transition: { duration: 0.18, ease: 'easeIn' } }}
        >
          {screen === 'title' && (
            <TitleScreen
              disabledLines={state.disabledLines}
              excludedCount={state.excluded.length}
              activeCount={activeIds.length}
              matchCount={state.history.length}
              onToggleLine={toggleLine}
              onStart={() => setScreen('battle')}
              onRanking={() => setScreen('ranking')}
            />
          )}
          {screen === 'battle' && (
            <BattleScreen
              state={state}
              activeIds={activeIds}
              onChange={setState}
              onRanking={() => setScreen('ranking')}
              onHome={() => setScreen('title')}
            />
          )}
          {screen === 'ranking' && (
            <RankingScreen
              state={state}
              activeIds={activeIds}
              onChange={setState}
              onBattle={() => setScreen('battle')}
              onHome={() => setScreen('title')}
              onReset={() => {
                setState(EMPTY_STATE)
                setScreen('title')
              }}
            />
          )}
        </motion.main>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          key={screen}
          className="wipe"
          style={{ skewX: -18 }}
          initial={{ x: '-120%' }}
          animate={{ x: '120%', transition: { duration: 0.55, ease: [0.7, 0, 0.3, 1] } }}
          aria-hidden
        />
      </AnimatePresence>
      <footer className="credit">
        Fan project. Not affiliated with Monster Energy. Can images © Monster Energy Company.
      </footer>
    </MotionConfig>
  )
}
