import { lazy, Suspense } from 'react'
import { BlurReveal } from '../../../components/BlurReveal/BlurReveal'
import { ConnectorLine } from '../../../components/ConnectorLine/ConnectorLine'
import { ScrambleText } from '../../../components/ScrambleText/ScrambleText'
import { useContent } from '../../../content/useContent'
import styles from './Intro.module.css'

const IntroSeeds = lazy(() =>
  import('./IntroSeeds').then((module) => ({ default: module.IntroSeeds })),
)

export function Intro() {
  const { home } = useContent()
  const { titleLines, paragraphs } = home.intro

  return (
    <section className={styles.intro}>
      <Suspense>
        <IntroSeeds />
      </Suspense>
      <h2 className={styles.title} aria-label={titleLines.join(' ')}>
        <ScrambleText text={titleLines[0]} className={styles.titleLine} />
        <ScrambleText text={titleLines[1]} className={styles.titleAccent} delay={0.15} />
      </h2>
      <div className={styles.column}>
        {paragraphs.map((text, i) => (
          <div key={i} className={styles.step}>
            <BlurReveal className={styles.text}>
              <p>{text}</p>
            </BlurReveal>
            {i < paragraphs.length - 1 && (
              <div className={styles.connector}>
                <ConnectorLine arrow={i === paragraphs.length - 2} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
