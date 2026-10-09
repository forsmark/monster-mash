import { motion } from 'motion/react'

/** Fixed backdrop: red field, turning sunburst, halftone dots and black slashes. */
export function Background() {
  return (
    <div className="bg" aria-hidden>
      <motion.div
        className="bg-burst"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
      />
      <motion.div
        className="bg-dots"
        animate={{ backgroundPosition: ['0px 0px', '22px 22px'] }}
        transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
      />
      <motion.div
        className="bg-slash"
        initial={{ x: '-100%', rotate: -9 }}
        animate={{ x: '0%', rotate: -9 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      />
      <motion.div
        className="bg-slash bg-slash-thin"
        initial={{ x: '100%', rotate: 5 }}
        animate={{ x: '0%', rotate: 5 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.25 }}
      />
    </div>
  )
}
