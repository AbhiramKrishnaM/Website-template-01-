import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../animation/gsap'
import { useIntroRevealed } from '../../animation/intro'
import { addScramble, setCharState } from '../../animation/scramble'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import type { TagName } from '../../lib/polymorphic'
import scramble from '../../styles/scramble.module.css'
import styles from './ScrambleText.module.css'

const CHAR_STAGGER = 0.03

interface ScrambleTextProps {
  text: string
  as?: TagName
  className?: string
  trigger?: 'scroll' | 'mount'
  delay?: number
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
  const revealed = useIntroRevealed()

  useGSAP(
    () => {
      const root = ref.current
      if (!root || reducedMotion || !revealed) return

      const chars = [...root.querySelectorAll<HTMLElement>('[data-char]')]
      const hide = () => chars.forEach((char) => setCharState(char, 'hidden'))
      const tl = gsap.timeline({ paused: true })
      chars.forEach((char, i) => addScramble(tl, char, delay + i * CHAR_STAGGER))
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
    {
      dependencies: [text, reducedMotion, revealed, trigger, delay],
      scope: ref,
      revertOnUpdate: true,
    },
  )

  const words = text.split(' ')
  const Tag = as as 'span'

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, w) => (
        <span key={w} className={styles.word} aria-hidden="true">
          {[...word].map((char, c) => (
            <span key={c} className={scramble.char} data-char data-state="done">
              <span className={scramble.final}>{char}</span>
            </span>
          ))}
          {w < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  )
}
