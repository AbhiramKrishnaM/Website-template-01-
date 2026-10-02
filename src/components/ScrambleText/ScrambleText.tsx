import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../animation/gsap'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import type { TagName } from '../../lib/polymorphic'
import styles from './ScrambleText.module.css'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CHAR_STAGGER = 0.03
const SWAP_INTERVAL = 0.045
const MIN_SWAPS = 4
const MAX_SWAPS = 8

type CharState = 'hidden' | 'scrambling' | 'done'

interface ScrambleTextProps {
  text: string
  as?: TagName
  className?: string
  trigger?: 'scroll' | 'mount'
  delay?: number
}

function setState(char: HTMLElement, state: CharState) {
  char.dataset.state = state
}

function setRandomGlyph(char: HTMLElement) {
  char.dataset.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
  char.style.setProperty('--clip', `${Math.round(Math.random() * 55)}%`)
}

function buildTimeline(chars: HTMLElement[], delay: number): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true })
  chars.forEach((char, i) => {
    const start = delay + i * CHAR_STAGGER
    const swaps = gsap.utils.random(MIN_SWAPS, MAX_SWAPS, 1)
    tl.call(setState, [char, 'scrambling'], start)
    for (let k = 0; k < swaps; k++) tl.call(setRandomGlyph, [char], start + k * SWAP_INTERVAL)
    tl.call(setState, [char, 'done'], start + swaps * SWAP_INTERVAL)
  })
  return tl
}

export function ScrambleText({
  text,
  as = 'span',
  className,
  trigger = 'scroll',
  delay = 0,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      const root = ref.current
      if (!root || reducedMotion) return

      const chars = [...root.querySelectorAll<HTMLElement>('[data-char]')]
      const hide = () => chars.forEach((char) => setState(char, 'hidden'))
      const tl = buildTimeline(chars, delay)
      const play = () => {
        hide()
        tl.restart()
      }

      hide()
      if (trigger === 'mount') {
        play()
        return
      }
      ScrollTrigger.create({
        trigger: root,
        start: 'top 88%',
        onEnter: play,
        onLeaveBack: () => {
          tl.pause()
          hide()
        },
      })
    },
    { dependencies: [text, reducedMotion, trigger, delay], scope: ref, revertOnUpdate: true },
  )

  const words = text.split(' ')

  const Tag = as as 'span'

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className={styles.word} aria-hidden="true">
          {[...word].map((char, c) => (
            <span key={c} className={styles.char} data-char data-state="done">
              <span className={styles.final}>{char}</span>
            </span>
          ))}
          {w < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  )
}
