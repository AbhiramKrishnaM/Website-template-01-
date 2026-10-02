import type { CSSProperties } from 'react'
import styles from './RollingText.module.css'

interface RollingTextProps {
  text: string
  altText?: string
  active?: boolean
  className?: string
}

function Row({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {[...text].map((char, i) => (
        <span key={i} className={styles.char} style={{ '--i': i } as CSSProperties}>
          {char}
        </span>
      ))}
    </span>
  )
}

export function RollingText({ text, altText = text, active = false, className }: RollingTextProps) {
  return (
    <span
      className={[styles.roll, className].filter(Boolean).join(' ')}
      data-active={active || undefined}
    >
      <span className={styles.label}>{active ? altText : text}</span>
      <Row text={text} className={styles.row} />
      <Row text={altText} className={`${styles.row} ${styles.next}`} />
    </span>
  )
}
