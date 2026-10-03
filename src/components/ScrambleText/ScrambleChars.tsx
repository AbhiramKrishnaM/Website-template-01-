import scramble from '../../styles/scramble.module.css'
import styles from './ScrambleText.module.css'

export function ScrambleChars({ text }: { text: string }) {
  const words = text.split(' ')
  return words.map((word, w) => (
    <span key={w} className={styles.word} aria-hidden="true">
      {[...word].map((char, c) => (
        <span key={c} className={scramble.char} data-char data-state="done">
          <span className={scramble.final}>{char}</span>
        </span>
      ))}
      {w < words.length - 1 && ' '}
    </span>
  ))
}
