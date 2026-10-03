import { BlurReveal } from '../../components/BlurReveal/BlurReveal'
import { ConnectorLine } from '../../components/ConnectorLine/ConnectorLine'
import { GlassFlower } from '../../components/GlassFlower/GlassFlower'
import { RoundButton } from '../../components/RoundButton/RoundButton'
import { ScrambleText } from '../../components/ScrambleText/ScrambleText'
import { SectionLabel } from '../../components/SectionLabel/SectionLabel'
import { FLOWER_IMAGES } from '../../content/images'
import styles from './UiLab.module.css'

export function UiLab() {
  return (
    <div className={styles.lab}>
      <ScrambleText as="h1" text="Shared UI components" className={styles.title} />

      <section className={styles.glassHero}>
        <GlassFlower src={FLOWER_IMAGES.hero} dissolveOnScroll className={styles.glass} />
        <p className={styles.glassQuote}>Glass flower, dissolving as it scrolls away</p>
      </section>

      <section className={styles.glassRow}>
        {[FLOWER_IMAGES.ctaPsychotherapy, FLOWER_IMAGES.ctaAbout, FLOWER_IMAGES.contact].map(
          (src) => (
            <GlassFlower key={src} src={src} className={styles.glassSmall} />
          ),
        )}
      </section>

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
