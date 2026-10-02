import { ScrambleText } from '../ScrambleText/ScrambleText'
import styles from './SectionLabel.module.css'

interface SectionLabelProps {
  label: string
  note?: string
}

export function SectionLabel({ label, note }: SectionLabelProps) {
  return (
    <div className={styles.label}>
      <span className={styles.arrow} aria-hidden="true" />
      <ScrambleText as="h2" text={label} className={styles.title} />
      {note && <span className={styles.note}>{note}</span>}
    </div>
  )
}
