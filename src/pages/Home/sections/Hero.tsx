import { useRef } from 'react'
import { gsap, useGSAP } from '../../../animation/gsap'
import { useIntroRevealed } from '../../../animation/intro'
import { addScramble, CYRILLIC, LATIN, setCharState } from '../../../animation/scramble'
import { GlassFlower } from '../../../components/GlassFlower/GlassFlower'
import { ScrambleChars } from '../../../components/ScrambleText/ScrambleChars'
import { FLOWER_IMAGES } from '../../../content/images'
import { useContent, useLang } from '../../../content/useContent'
import { useReducedMotion } from '../../../hooks/useMediaQuery'
import styles from './Hero.module.css'

const LINE_EXIT = [0.36, 0.5, 0.64, 0.78]
const DISSOLVE_START = 0.3
const DISSOLVE_END = 1
const SCRUB_SECONDS = 1.4

export function Hero() {
  const { home } = useContent()
  const lang = useLang()
  const sectionRef = useRef<HTMLElement>(null)
  const dissolveRef = useRef(0)
  const revealed = useIntroRevealed()
  const reducedMotion = useReducedMotion()
  const lines = home.heroLines

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return
      const lineEls = [...section.querySelectorAll<HTMLElement>('[data-line]')]
      const charsOf = (line: HTMLElement) => [...line.querySelectorAll<HTMLElement>('[data-char]')]
      const allChars = lineEls.flatMap(charsOf)
      const glyphs = lang === 'uk' ? CYRILLIC : LATIN

      if (reducedMotion) {
        allChars.forEach((char) => setCharState(char, 'done'))
        return
      }
      allChars.forEach((char) => setCharState(char, 'hidden'))
      if (!revealed) return

      const intro = gsap.timeline()
      lineEls.forEach((line, l) =>
        charsOf(line).forEach((char, i) =>
          addScramble(intro, char, 0.25 + l * 0.18 + i * 0.02, { glyphs }),
        ),
      )

      const shown = lineEls.map(() => true)
      const toggleLine = (index: number, show: boolean) => {
        intro.progress(1).kill()
        const tl = gsap.timeline()
        charsOf(lineEls[index]).forEach((char, i) =>
          addScramble(tl, char, i * 0.015, {
            glyphs,
            minSwaps: 3,
            maxSwaps: 6,
            end: show ? 'done' : 'hidden',
          }),
        )
      }

      const progress = { value: 0 }
      gsap.to(progress, {
        value: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SECONDS,
        },
        onUpdate: () => {
          const p = progress.value
          dissolveRef.current = gsap.utils.clamp(
            0,
            1,
            (p - DISSOLVE_START) / (DISSOLVE_END - DISSOLVE_START),
          )
          LINE_EXIT.forEach((at, index) => {
            const show = p < at
            if (show === shown[index]) return
            shown[index] = show
            toggleLine(index, show)
          })
        },
      })
    },
    {
      dependencies: [revealed, reducedMotion, lang, lines.join('|')],
      scope: sectionRef,
      revertOnUpdate: true,
    },
  )

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div className={styles.sticky}>
        <GlassFlower src={FLOWER_IMAGES.hero} dissolve={dissolveRef} className={styles.flower} />
        <h1 className={styles.quote} aria-label={lines.join(' ')}>
          {lines.map((line, i) => (
            <span key={i} className={styles.line} data-line>
              <ScrambleChars text={line} />
            </span>
          ))}
        </h1>
      </div>
    </section>
  )
}
