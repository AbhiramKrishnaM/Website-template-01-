import { BlurReveal } from '../../components/BlurReveal/BlurReveal'
import { ConnectorLine } from '../../components/ConnectorLine/ConnectorLine'
import { RoundButton } from '../../components/RoundButton/RoundButton'
import { ScrambleText } from '../../components/ScrambleText/ScrambleText'
import { SectionLabel } from '../../components/SectionLabel/SectionLabel'
import styles from './UiLab.module.css'

export function UiLab() {
  return (
    <div className={styles.lab}>
      <ScrambleText as="h1" text="Shared UI components" className={styles.title} />

      <section className={styles.block}>
        <SectionLabel label="Section label" note="(with a note)" />
      </section>

      <section className={styles.block}>
        <BlurReveal className={styles.copy}>
          <p>Each paragraph fades in from a soft blur as it scrolls into view.</p>
          <p>The second one follows a moment later, so the block reads as a sequence.</p>
          <p>And the third closes it, with the same easing and distance.</p>
        </BlurReveal>
        <ConnectorLine />
        <BlurReveal className={styles.copy}>
          <p>A thin line draws itself between blocks as the page moves.</p>
        </BlurReveal>
        <ConnectorLine arrow />
      </section>

      <section className={styles.block}>
        <ScrambleText as="h2" text="A heading that decodes" className={styles.heading} />
        <RoundButton>Send a request</RoundButton>
      </section>
    </div>
  )
}
