import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../animation/gsap'
import { setIntroPhase, useIntroPhase } from '../../animation/intro'
import { addScramble, CYRILLIC, LATIN, setCharState } from '../../animation/scramble'
import { EASE } from '../../animation/tokens'
import { useContent, useLang } from '../../content/useContent'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import scramble from '../../styles/scramble.module.css'
import { buildGrid } from './buildGrid'
import { preloadAssets } from './preloadAssets'
import styles from './Preloader.module.css'

const MIN_FILL_SECONDS = 1.6
const SETTLE_SECONDS = 0.5
const IDLE_TIMEOUT_MS = 2500
const INTERACTION_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']

function waitForInteraction(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, finish))
      resolve()
    }
    const timer = setTimeout(finish, IDLE_TIMEOUT_MS)
    INTERACTION_EVENTS.forEach((type) =>
      window.addEventListener(type, finish, { once: true, passive: true }),
    )
    signal.addEventListener('abort', finish)
  })
}

function finished(animation: gsap.core.Animation): Promise<void> {
  return new Promise((resolve) => animation.then(() => resolve()))
}

function flyToLogo(letters: HTMLElement[], targets: HTMLElement[], tl: gsap.core.Timeline) {
  letters.forEach((letter, i) => {
    const target = targets[i]
    if (!target) {
      tl.to(letter, { autoAlpha: 0, duration: 0.4 }, 0)
      return
    }
    const from = letter.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    tl.to(
      letter,
      {
        x: to.left + to.width / 2 - (from.left + from.width / 2),
        y: to.top + to.height / 2 - (from.top + from.height / 2),
        scale: to.height / from.height,
        duration: 1.2,
        ease: EASE.inOut,
      },
      0.2 + i * 0.02,
    )
  })
}

function PreloaderOverlay() {
  const { siteName } = useContent()
  const lang = useLang()
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [grid] = useState(() => buildGrid(siteName, lang === 'uk' ? CYRILLIC : LATIN))

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const glyphs = lang === 'uk' ? CYRILLIC : LATIN
      const cells = [...root.querySelectorAll<HTMLElement>('[data-cell]')]
      const thresholds = cells.map(() => Math.random() * 0.95)
      const started = new Set<number>()
      const fill = { value: 0 }
      const controller = new AbortController()
      document.documentElement.dataset.loading = ''

      const revealUpTo = () => {
        cells.forEach((cell, i) => {
          if (started.has(i) || thresholds[i] > fill.value) return
          started.add(i)
          addScramble(gsap.timeline(), cell, 0, { glyphs })
        })
      }

      const fillTo = (ratio: number, duration: number) =>
        gsap.to(fill, { value: ratio, duration, ease: 'power1.out', onUpdate: revealUpTo })

      const exit = () => {
        const brand = cells.filter((cell) => cell.dataset.brand !== undefined)
        const noise = cells.filter((cell) => cell.dataset.brand === undefined)
        const targets = [...document.querySelectorAll<HTMLElement>('[data-logo-letter]')]
        const tl = gsap.timeline({
          onComplete: () => {
            delete document.documentElement.dataset.loading
            setIntroPhase('done')
          },
        })

        if (reducedMotion) {
          tl.call(setIntroPhase, ['reveal']).to(root, { autoAlpha: 0, duration: 0.4 })
          return
        }
        tl.to(noise, { autoAlpha: 0, duration: 0.5, stagger: { amount: 0.5, from: 'random' } }, 0)
        flyToLogo(brand, targets, tl)
        tl.call(setIntroPhase, ['reveal'], 0.9)
        tl.set(root, { pointerEvents: 'none' }, 0.9)
        tl.to(root, { backgroundColor: 'transparent', duration: 0.6 }, 0.9)
      }

      const run = async () => {
        cells.forEach((cell) => setCharState(cell, reducedMotion ? 'done' : 'hidden'))
        const startedAt = performance.now()
        await preloadAssets((ratio) => {
          if (!reducedMotion) fillTo(ratio * 0.9, 0.6)
        })
        if (controller.signal.aborted) return

        if (!reducedMotion) {
          const elapsed = (performance.now() - startedAt) / 1000
          await finished(fillTo(1, Math.max(0.4, MIN_FILL_SECONDS - elapsed)))
          await finished(gsap.delayedCall(SETTLE_SECONDS, () => {}))
        }
        await waitForInteraction(controller.signal)
        if (!controller.signal.aborted) exit()
      }

      run()
      return () => {
        controller.abort()
        delete document.documentElement.dataset.loading
      }
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={styles.overlay} aria-hidden="true">
      <div className={styles.grid}>
        {grid.map((row, r) => (
          <div key={r} className={styles.row}>
            {row.map((cell, c) => (
              <span
                key={c}
                className={scramble.char}
                data-cell
                data-brand={cell.brand || undefined}
                data-state="hidden"
              >
                <span className={scramble.final}>{cell.char}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Preloader() {
  const phase = useIntroPhase()
  return phase === 'done' ? null : <PreloaderOverlay />
}
