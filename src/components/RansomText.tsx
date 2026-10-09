import { motion } from 'motion/react'

const FONTS = ['f-anton', 'f-archivo', 'f-rubik', 'f-bebas']
const SKINS = ['s-paper', 's-ink', 's-red', 's-paper', 's-ink']

// Small deterministic hash, so each letter keeps its look between renders.
function hash(n: number) {
  let x = (n + 0x9e3779b9) | 0
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return (x ^ (x >>> 16)) >>> 0
}

type Props = {
  text: string
  seed?: number
  className?: string
  as?: 'h1' | 'h2' | 'span'
}

/** Persona-style ransom-note letters: every glyph cut from a different page. */
export function RansomText({ text, seed = 1, className = '', as = 'h1' }: Props) {
  const Tag = motion[as]
  return (
    <Tag className={`ransom ${className}`} aria-label={text}>
      {text.split(' ').map((word, w, words) => {
        // Character offset of this word, so each letter keeps a stable look.
        const start = words.slice(0, w).join(' ').length + (w ? 1 : 0)
        return (
          <span key={w} className="ransom-word">
            {[...word].map((ch, j) => {
              const i = start + j
              const h = hash(i * 31 + seed * 977 + ch.charCodeAt(0))
              const rotate = ((h % 17) - 8) * 1.1
              const lift = ((h >>> 5) % 9) - 4
              return (
                <motion.span
                  key={j}
                  aria-hidden
                  className={`ransom-char ${FONTS[(h >>> 3) % FONTS.length]} ${SKINS[(h >>> 7) % SKINS.length]}`}
                  initial={{ opacity: 0, y: -40, rotate: rotate * 4, scale: 1.6 }}
                  animate={{ opacity: 1, y: lift, rotate, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22, delay: i * 0.035 }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
        )
      })}
    </Tag>
  )
}
