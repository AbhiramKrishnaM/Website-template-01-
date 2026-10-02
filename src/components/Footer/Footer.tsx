import { Link } from 'react-router'
import { useContent } from '../../content/useContent'
import { useLocalizedPath } from '../../lib/useLocalizedPath'
import { BlurReveal } from '../BlurReveal/BlurReveal'
import { NavLinks } from '../NavLinks/NavLinks'
import { RollingText } from '../RollingText/RollingText'
import { ScrambleText } from '../ScrambleText/ScrambleText'
import styles from './Footer.module.css'

const CREDIT_URL = 'https://olhalazarieva.com/'
const YEAR = new Date().getFullYear()

export function Footer() {
  const { siteName, email, footer } = useContent()
  const localize = useLocalizedPath()

  return (
    <footer className={styles.footer}>
      <ScrambleText as="p" text={siteName} className={styles.wordmark} />
      <BlurReveal className={styles.body}>
        <NavLinks className={styles.nav} />
        <a href={`mailto:${email}`} className={styles.email}>
          {footer.emailLabel} {email}
        </a>
      </BlurReveal>
      <div className={styles.bottom}>
        <span>
          © {YEAR} {footer.rights}
        </span>
        <Link to={localize('/privacy-policy')}>
          <RollingText text={footer.privacy} />
        </Link>
        <a href={CREDIT_URL} target="_blank" rel="noreferrer">
          <RollingText text={footer.credit} />
        </a>
      </div>
    </footer>
  )
}
