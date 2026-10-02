import { useEffect } from 'react'
import { Link } from 'react-router'
import { useContent } from '../../content/useContent'
import { useLocalizedPath } from '../../lib/useLocalizedPath'
import { LangSwitch } from '../LangSwitch/LangSwitch'
import { ScrambleText } from '../ScrambleText/ScrambleText'
import styles from './MobileMenu.module.css'

interface MobileMenuProps {
  id: string
  open: boolean
}

export function MobileMenu({ id, open }: MobileMenuProps) {
  const { nav, menu, email } = useContent()
  const localize = useLocalizedPath()
  const links = [
    { to: localize('/psychotherapy'), label: nav.psychotherapy },
    { to: localize('/about'), label: nav.about },
    { to: localize('/contacts'), label: nav.contact },
  ]

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div id={id} className={styles.menu} data-open={open || undefined} inert={!open}>
      {open && (
        <>
          <ScrambleText as="p" text={menu.title} trigger="mount" className={styles.title} />
          <ol className={styles.links}>
            {links.map(({ to, label }, i) => (
              <li key={to}>
                <span className={styles.index}>({String(i + 1).padStart(2, '0')})</span>
                <Link to={to}>
                  <ScrambleText text={label} trigger="mount" delay={0.1 + i * 0.08} />
                </Link>
              </li>
            ))}
          </ol>
          <Link to={`${localize('/contacts')}#form`} className={styles.book}>
            {menu.book}
          </Link>
          <a href={`mailto:${email}`} className={styles.email}>
            {menu.emailLabel} {email}
          </a>
          <LangSwitch className={styles.lang} />
        </>
      )}
    </div>
  )
}
