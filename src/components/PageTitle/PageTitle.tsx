import { ScrambleText } from '../ScrambleText/ScrambleText'
import styles from './PageTitle.module.css'

export function PageTitle({ text }: { text: string }) {
  return (
    <div className={styles.wrap}>
      <ScrambleText as="h1" text={text} trigger="mount" className={styles.title} />
    </div>
  )
}
