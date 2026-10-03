import { Fragment, lazy, Suspense, useRef } from 'react'
import { gsap, useGSAP } from '../../../animation/gsap'
import { useIntroRevealed } from '../../../animation/intro'
import { SectionLabel } from '../../../components/SectionLabel/SectionLabel'
import { useContent } from '../../../content/useContent'
import { useFinePointer, useReducedMotion } from '../../../hooks/useMediaQuery'
import styles from './Cards.module.css'
import type { CardsClock } from './FlowerStage'

const FlowerStage = lazy(() =>
  import('./FlowerStage').then((module) => ({ default: module.FlowerStage })),
)

const FILL_CLASSES = [styles.fillTwo, styles.fillThree, styles.fillFour, styles.fillFive]
const CIRCLE_CLASSES = [styles.circleTwo, styles.circleThree, styles.circleFour, styles.circleFive]
const SCRUB_DESKTOP = 1.2
const SCRUB_TOUCH = 0.2
// Timeline units: transition k (to slide k) starts at 2(k-1); the wipe takes 1 unit, then the slide holds for 1.
const UNITS_PER_SLIDE = 2
const WIPE_DURATION = 1
const CARD_SWAP_AT = 0.5
const DIGIT_OUT_AT = 0.1
const DIGIT_OUT_DURATION = 0.28
const DIGIT_IN_AT = 0.38
const DIGIT_IN_DURATION = 0.48
const DIM_OPACITY = 0.3
const WORD_DURATION = 1.05
const WORD_STAGGER_MAX = 0.085

// The wipe grows out of the progress circle for the next slide, from that circle's size to past the farthest corner.
function wipeCircle(circle: HTMLElement, sticky: HTMLElement, full: boolean): string {
  const area = sticky.getBoundingClientRect()
  const rect = circle.getBoundingClientRect()
  const x = rect.left - area.left + rect.width / 2
  const y = rect.top - area.top + rect.height / 2
  const reach = Math.hypot(Math.max(x, area.width - x), Math.max(y, area.height - y)) + 2
  const radius = full ? reach : Math.min(rect.width, rect.height) / 2
  return `circle(${radius}px at ${x}px ${y}px)`
}

// Spaces stay outside the overflow masks; a trailing space inside an inline-block collapses.
function Words({ text }: { text: string }) {
  return text.split(' ').map((word, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className={styles.wordMask}>
        <span className={styles.word} data-word>
          {word}
        </span>
      </span>
    </Fragment>
  ))
}

export function Cards() {
  const { home } = useContent()
  const sectionRef = useRef<HTMLElement>(null)
  const clockRef = useRef<CardsClock>({ time: 0 })
  const reducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const revealed = useIntroRevealed()
  const { slides, label } = home.cards
  const total = slides.length

  useGSAP(
    () => {
      const section = sectionRef.current
      const sticky = section?.querySelector<HTMLElement>('[data-sticky]')
      if (!section || !sticky || reducedMotion || !revealed) return

      const q = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, section)
      const cards = q('[data-card]')
      const fills = q('[data-fill]')
      const circles = q('[data-circle]')
      const labels = q('[data-circle-label]')
      const digits = q('[data-digit]')
      const zero = section.querySelector('[data-zero]')
      const heading = section.querySelector('[data-heading]')

      gsap.set(cards, { autoAlpha: (i: number) => (i === 0 ? 1 : 0) })
      gsap.set(digits, {
        clipPath: (i: number) => (i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)'),
        yPercent: (i: number) => (i === 0 ? 0 : -20),
        opacity: (i: number) => (i === 0 || !finePointer ? 1 : DIM_OPACITY),
      })
      fills.forEach((fill, i) =>
        gsap.set(fill, { clipPath: wipeCircle(circles[i], sticky, false) }),
      )

      const showCard = (index: number) => {
        cards.forEach((card, i) => {
          if (i !== index) {
            gsap.set(card, { autoAlpha: 0 })
            return
          }
          const words = card.querySelectorAll('[data-word]')
          const stagger =
            words.length > 1 ? Math.min(WORD_STAGGER_MAX, WORD_DURATION / (words.length - 1)) : 0
          gsap.set(card, { autoAlpha: 1 })
          gsap.fromTo(
            words,
            { autoAlpha: 0, xPercent: -110 },
            { autoAlpha: 1, xPercent: 0, duration: WORD_DURATION, ease: 'power2.out', stagger },
          )
          gsap.fromTo(
            card.querySelector('blockquote'),
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.8, delay: 0.3 },
          )
        })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: finePointer ? SCRUB_DESKTOP : SCRUB_TOUCH,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          clockRef.current.time = tl.time()
        },
      })

      tl.to(heading, { autoAlpha: 0, duration: 0.15, ease: 'none' }, 0)
      if (finePointer) tl.to(zero, { opacity: DIM_OPACITY, duration: 0.2, ease: 'none' }, 0.25)

      for (let k = 1; k < total; k++) {
        const at = UNITS_PER_SLIDE * (k - 1)
        tl.to(
          fills[k - 1],
          {
            clipPath: () => wipeCircle(circles[k - 1], sticky, true),
            duration: WIPE_DURATION,
            ease: 'power1.inOut',
          },
          at,
        )
          .to(labels[k - 1], { autoAlpha: 0, duration: 0.06, ease: 'none' }, at)
          .to(cards[k - 1], { autoAlpha: 0, duration: 0.06, ease: 'none' }, at)
          .to(
            digits[k - 1],
            {
              clipPath: 'inset(0% 0% 100% 0%)',
              yPercent: 20,
              duration: DIGIT_OUT_DURATION,
              ease: 'sine.inOut',
            },
            at + DIGIT_OUT_AT,
          )
          .to(
            digits[k],
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              yPercent: 0,
              duration: DIGIT_IN_DURATION,
              ease: 'sine.inOut',
            },
            at + DIGIT_IN_AT,
          )
          .call(
            () => showCard(tl.scrollTrigger && tl.scrollTrigger.direction < 0 ? k - 1 : k),
            undefined,
            at + CARD_SWAP_AT,
          )
      }
      tl.to({}, { duration: UNITS_PER_SLIDE * (total - 1) - tl.duration() })
      showCard(0)
    },
    {
      dependencies: [reducedMotion, revealed, finePointer, total],
      scope: sectionRef,
      revertOnUpdate: true,
    },
  )

  if (reducedMotion) {
    return (
      <section className={styles.static} data-seed-land>
        <SectionLabel label={label} />
        {slides.map((slide, i) => (
          <article key={i} className={styles.staticCard}>
            <span className={styles.staticNumber}>0{i + 1}</span>
            <h3 className={styles.title}>{slide.title}</h3>
            <blockquote className={styles.quote}>
              <p className={styles.quoteText}>“{slide.quote}”</p>
              <cite className={styles.author}>{slide.author}</cite>
            </blockquote>
          </article>
        ))}
      </section>
    )
  }

  return (
    <section ref={sectionRef} className={styles.cards} data-seed-land>
      <div className={styles.sticky} data-sticky>
        {FILL_CLASSES.map((fillClass, i) => (
          <span key={i} className={`${styles.fill} ${fillClass}`} data-fill aria-hidden="true" />
        ))}

        <div className={styles.container}>
          <div className={styles.heading} data-heading>
            <SectionLabel label={label} />
          </div>

          <Suspense>
            <FlowerStage clock={clockRef} />
          </Suspense>

          <span className={styles.counter} aria-hidden="true">
            <span className={styles.zero} data-zero>
              0
            </span>
            <span className={styles.window}>
              {slides.map((_, i) => (
                <span key={i} className={styles.digit} data-digit>
                  {i + 1}
                </span>
              ))}
            </span>
          </span>

          {slides.map((slide, i) => (
            <article key={i} className={styles.card} data-card>
              <h3 className={styles.title} aria-label={slide.title}>
                <span aria-hidden="true">
                  <Words text={slide.title} />
                </span>
              </h3>
              <blockquote className={styles.quote}>
                <p className={styles.quoteText}>“{slide.quote}”</p>
                <cite className={styles.author}>{slide.author}</cite>
              </blockquote>
            </article>
          ))}

          <div className={styles.progress} aria-hidden="true">
            {CIRCLE_CLASSES.map((circleClass, i) => (
              <span key={i} className={`${styles.circle} ${circleClass}`} data-circle>
                <span className={styles.circleLabel} data-circle-label>
                  {i + 2}/{total}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
