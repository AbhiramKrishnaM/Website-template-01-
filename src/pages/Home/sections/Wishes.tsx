import { lazy, Suspense, useRef } from 'react'
import { gsap, useGSAP } from '../../../animation/gsap'
import { useIntroRevealed } from '../../../animation/intro'
import { SectionLabel } from '../../../components/SectionLabel/SectionLabel'
import { useContent } from '../../../content/useContent'
import { useFinePointer, useReducedMotion } from '../../../hooks/useMediaQuery'
import styles from './Wishes.module.css'

const RanunculusScene = lazy(() =>
  import('./RanunculusScene').then((module) => ({ default: module.RanunculusScene })),
)

const LETTER_SOURCE_MAP = [0, 1, 2, 3, 4, 1, 5, 5]
const SCRUB_DESKTOP = 1.2
const SCRUB_TOUCH = 0.2

const TARGET_Y_PERCENT = -30

function FoliageLeft() {
  return (
    <svg
      className={styles.foliageLeft}
      data-foliage-left
      viewBox="0 0 300 500"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M -20 520 Q 80 400 60 250 Q 40 100 120 20 Q 90 120 70 260 Q 50 400 -20 520 Z"
        fill="#364034"
      />
      <path d="M 50 280 Q 150 240 220 180 Q 140 230 60 270 Z" fill="#444f41" />
      <path d="M 70 200 Q 180 150 250 90 Q 160 160 80 190 Z" fill="#4e5b4a" />
      <path d="M 60 360 Q 160 320 240 270 Q 150 330 70 350 Z" fill="#394436" />
      <path d="M -10 480 Q 120 420 190 350 Q 100 420 -10 480 Z" fill="#2e372c" />
    </svg>
  )
}

function FoliageRight() {
  return (
    <svg
      className={styles.foliageRight}
      data-foliage-right
      viewBox="0 0 320 540"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 340 560 Q 220 430 240 270 Q 260 110 180 20 Q 220 130 230 280 Q 240 430 340 560 Z"
        fill="#364034"
      />
      <path d="M 230 300 Q 120 260 50 190 Q 130 240 220 290 Z" fill="#444f41" />
      <path d="M 220 220 Q 100 170 30 100 Q 120 180 210 210 Z" fill="#4e5b4a" />
      <path d="M 240 380 Q 130 340 50 280 Q 140 350 230 370 Z" fill="#394436" />
      <path d="M 330 500 Q 190 440 110 360 Q 210 440 330 500 Z" fill="#2e372c" />
    </svg>
  )
}

export function Wishes() {
  const { home } = useContent()
  const sectionRef = useRef<HTMLElement>(null)
  const scaleRef = useRef(1)
  const reducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const revealed = useIntroRevealed()
  const { wishes } = home
  const { featured, items, wellnessWord, heading, note } = wishes

  useGSAP(
    () => {
      const section = sectionRef.current
      const sticky = section?.querySelector<HTMLElement>('[data-sticky]')
      if (!section || !sticky || reducedMotion || !revealed) return

      const q = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, section)
      const gridTrack = section.querySelector<HTMLElement>('[data-grid-track]')
      const cardTexts = q('[data-card-text]')
      const sourceInitials = q('[data-source-initial]')
      const wellnessWordEl = section.querySelector<HTMLElement>('[data-wellness-word]')
      const wellnessLetters = q('[data-wellness-letter]')
      const sceneCanvas = section.querySelector<HTMLElement>('[data-scene-canvas]')
      const foliageLeft = section.querySelector<HTMLElement>('[data-foliage-left]')
      const foliageRight = section.querySelector<HTMLElement>('[data-foliage-right]')
      const creamOverlay = section.querySelector<HTMLElement>('[data-cream-overlay]')

      if (!gridTrack || !wellnessWordEl) return

      const computeDeltas = () => {
        const stickyRect = sticky.getBoundingClientRect()
        const gridTrackRect = gridTrack.getBoundingClientRect()
        const takeoffYShift = gridTrackRect.height * (TARGET_Y_PERCENT / 100)

        return wellnessLetters.map((letterEl, index) => {
          const sourceIndex = LETTER_SOURCE_MAP[index] ?? 0
          const sourceEl = sourceInitials[sourceIndex] ?? sourceInitials[0]
          const sourceRect = sourceEl.getBoundingClientRect()
          const letterRect = letterEl.getBoundingClientRect()

          const sourceCenterX = sourceRect.left - stickyRect.left + sourceRect.width / 2
          const sourceCenterY =
            sourceRect.top - stickyRect.top + sourceRect.height / 2 + takeoffYShift
          const letterCenterX = letterRect.left - stickyRect.left + letterRect.width / 2
          const letterCenterY = letterRect.top - stickyRect.top + letterRect.height / 2

          const dx = sourceCenterX - letterCenterX
          const dy = sourceCenterY - letterCenterY
          const scale = sourceRect.height / Math.max(letterRect.height, 1)

          return { dx, dy, scale }
        })
      }

      let deltas = computeDeltas()

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: finePointer ? SCRUB_DESKTOP : SCRUB_TOUCH,
          invalidateOnRefresh: true,
          onRefresh: () => {
            deltas = computeDeltas()
          },
        },
      })

      tl.to(gridTrack, { yPercent: TARGET_Y_PERCENT, duration: 0.3, ease: 'power1.inOut' }, 0)

      tl.to(
        cardTexts,
        { autoAlpha: 0, filter: 'blur(8px)', duration: 0.08, ease: 'power2.inOut', stagger: 0.005 },
        0.22,
      )

      tl.to(sourceInitials, { autoAlpha: 0, duration: 0.04, ease: 'none' }, 0.3)

      wellnessLetters.forEach((letterEl, i) => {
        const d = deltas[i]
        tl.fromTo(
          letterEl,
          {
            x: () => deltas[i]?.dx ?? d.dx,
            y: () => deltas[i]?.dy ?? d.dy,
            scale: () => deltas[i]?.scale ?? d.scale,
            opacity: i === 0 ? 0.9 : 0.3,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.16,
            ease: 'power2.inOut',
          },
          0.3,
        )
      })

      if (sceneCanvas) {
        tl.to(sceneCanvas, { opacity: 1, duration: 0.14, ease: 'power1.inOut' }, 0.4)
      }

      if (foliageLeft && foliageRight) {
        tl.to(
          [foliageLeft, foliageRight],
          { opacity: 0.8, y: 0, duration: 0.14, ease: 'power1.out' },
          0.4,
        ).to([foliageLeft, foliageRight], { y: -25, duration: 0.3, ease: 'none' }, 0.54)
      }

      const flowerScaleObj = { scale: 1 }
      tl.to(
        flowerScaleObj,
        {
          scale: 1.15,
          duration: 0.16,
          ease: 'power1.in',
          onUpdate: () => {
            scaleRef.current = flowerScaleObj.scale
          },
        },
        0.82,
      )

      tl.to(wellnessWordEl, { autoAlpha: 0, duration: 0.08, ease: 'power2.in' }, 0.84)

      if (foliageLeft && foliageRight) {
        tl.to(
          [foliageLeft, foliageRight],
          { opacity: 0, filter: 'blur(36px)', duration: 0.12, ease: 'power2.in' },
          0.86,
        )
      }

      if (creamOverlay) {
        tl.to(creamOverlay, { opacity: 1, duration: 0.14, ease: 'power2.inOut' }, 0.86)
      }
    },
    {
      dependencies: [reducedMotion, revealed, finePointer],
      scope: sectionRef,
      revertOnUpdate: true,
    },
  )

  if (reducedMotion) {
    return (
      <section className={styles.static}>
        <SectionLabel label={heading} note={note} />

        <article className={styles.featuredCard}>
          <div className={styles.featuredInitialWrap}>
            <span className={styles.featuredInitial}>{featured.initial}</span>
          </div>
          <span className={styles.rule} aria-hidden="true" />
          <div className={styles.featuredContent}>
            <span className={styles.wishNumber}>{featured.number}</span>
            <h3 className={styles.featuredTitle}>{featured.title}</h3>
            <span className={styles.featuredSubtitle}>{featured.subtitle}</span>
            <div className={styles.featuredParagraphs}>
              {featured.paragraphs.map((p, idx) => (
                <p key={idx} className={styles.paragraph}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </article>

        <div className={styles.wishesRowThree}>
          {items.slice(0, 3).map((item, idx) => (
            <article key={idx} className={styles.card}>
              <span className={styles.wishNumber}>{item.number}</span>
              <h4 className={styles.cardTitle}>{item.title}</h4>
              <span className={styles.cardInitial}>{item.initial}</span>
            </article>
          ))}
        </div>

        <div className={styles.wishesRowTwo}>
          {items.slice(3, 5).map((item, idx) => (
            <article key={idx} className={styles.card}>
              <span className={styles.wishNumber}>{item.number}</span>
              <h4 className={styles.cardTitle}>{item.title}</h4>
              <span className={styles.cardInitial}>{item.initial}</span>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className={styles.wishes}>
      <div className={styles.sticky} data-sticky>
        <div className={styles.sceneCanvas} data-scene-canvas>
          <Suspense>
            <RanunculusScene scaleRef={scaleRef} />
          </Suspense>
        </div>

        <FoliageLeft />
        <FoliageRight />
        <div className={styles.creamOverlay} data-cream-overlay aria-hidden="true" />

        <div className={styles.wellnessWord} data-wellness-word aria-label={wellnessWord}>
          {wellnessWord.split('').map((letter, i) => (
            <span key={i} className={styles.wellnessLetter} data-wellness-letter>
              {letter}
            </span>
          ))}
        </div>

        <div className={styles.container}>
          <div className={styles.header} data-card-text>
            <SectionLabel label={heading} note={note} />
          </div>

          <div className={styles.gridTrack} data-grid-track>
            <article className={styles.featuredCard}>
              <div className={styles.featuredInitialWrap}>
                <span className={styles.featuredInitial} data-source-initial>
                  {featured.initial}
                </span>
              </div>
              <span className={styles.rule} data-card-text aria-hidden="true" />
              <div className={styles.featuredContent} data-card-text>
                <span className={styles.wishNumber}>{featured.number}</span>
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                <span className={styles.featuredSubtitle}>{featured.subtitle}</span>
                <div className={styles.featuredParagraphs}>
                  {featured.paragraphs.map((p, idx) => (
                    <p key={idx} className={styles.paragraph}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </article>

            <div className={styles.wishesRowThree}>
              {items.slice(0, 3).map((item, idx) => (
                <article key={idx} className={styles.card}>
                  <div data-card-text>
                    <span className={styles.wishNumber}>{item.number}</span>
                    <h4 className={styles.cardTitle}>{item.title}</h4>
                  </div>
                  <span className={styles.cardInitial} data-source-initial>
                    {item.initial}
                  </span>
                </article>
              ))}
            </div>

            <div className={styles.wishesRowTwo}>
              {items.slice(3, 5).map((item, idx) => (
                <article key={idx} className={styles.card}>
                  <div data-card-text>
                    <span className={styles.wishNumber}>{item.number}</span>
                    <h4 className={styles.cardTitle}>{item.title}</h4>
                  </div>
                  <span className={styles.cardInitial} data-source-initial>
                    {item.initial}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
