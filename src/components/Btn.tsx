import { motion, type HTMLMotionProps } from 'motion/react'

const spring = { type: 'spring', stiffness: 600, damping: 20 } as const

/** Skewed Persona button. Framer Motion owns the transform, so CSS must not set one. */
export function Btn({ disabled, style, ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      style={{ skewX: -12, ...style }}
      whileHover={disabled ? undefined : { x: -3, y: -3, rotate: -1.5, scale: 1.04, transition: spring }}
      whileTap={disabled ? undefined : { x: 3, y: 3, scale: 0.95, transition: spring }}
      {...props}
    />
  )
}
