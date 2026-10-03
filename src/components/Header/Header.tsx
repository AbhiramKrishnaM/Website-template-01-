import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useIntroPhase } from '../../animation/intro'
import { useContent } from '../../content/useContent'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useLocalizedPath } from '../../lib/useLocalizedPath'
import { LangSwitch } from '../LangSwitch/LangSwitch'
import { MobileMenu } from '../MobileMenu/MobileMenu'
import { NavLinks } from '../NavLinks/NavLinks'
import { RollingText } from '../RollingText/RollingText'
import styles from './Header.module.css'

export function Header() {
  const { siteName, menu } = useContent()
  const localize = useLocalizedPath()
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const introPhase = useIntroPhase()
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const menuOpen = isMobile && openedOn === pathname

  return (
    <header className={styles.header}>
      <span className={styles.frost} aria-hidden="true" />
      <Link
        to={localize('/')}
        className={styles.wordmark}
        aria-label={siteName}
        data-hidden={introPhase !== 'done' || undefined}
      >
        {[...siteName].map((char, i) =>
          char === ' ' ? (
            ' '
          ) : (
            <span key={i} data-logo-letter aria-hidden="true">
              {char}
            </span>
          ),
        )}
      </Link>

      {isMobile ? (
        <>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setOpenedOn(menuOpen ? null : pathname)}
          >
            <RollingText text={menu.open} altText={menu.close} active={menuOpen} />
          </button>
          <MobileMenu id="mobile-menu" open={menuOpen} />
        </>
      ) : (
        <>
          <NavLinks className={styles.nav} />
          <LangSwitch />
        </>
      )}
    </header>
  )
}
