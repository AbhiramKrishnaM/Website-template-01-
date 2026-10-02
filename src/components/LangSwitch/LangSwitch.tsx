import { Link } from 'react-router'
import { useContent, useLang } from '../../content/useContent'
import { LANGS } from '../../lib/i18n'
import { useSwitchLangPath } from '../../lib/useLocalizedPath'
import styles from './LangSwitch.module.css'

export function LangSwitch({ className }: { className?: string }) {
  const lang = useLang()
  const { langLabels } = useContent()
  const switchPath = useSwitchLangPath()

  return (
    <nav className={[styles.switch, className].filter(Boolean).join(' ')} aria-label="Language">
      {LANGS.map((option, i) => (
        <span key={option} className={styles.item}>
          {i > 0 && <span className={styles.dash} aria-hidden="true" />}
          <Link
            to={switchPath(option)}
            hrefLang={option}
            className={styles.link}
            aria-current={option === lang ? 'true' : undefined}
          >
            {langLabels[option]}
          </Link>
        </span>
      ))}
    </nav>
  )
}
