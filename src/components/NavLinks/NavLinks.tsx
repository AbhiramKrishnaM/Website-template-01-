import { NavLink } from 'react-router'
import { useContent } from '../../content/useContent'
import { useLocalizedPath } from '../../lib/useLocalizedPath'
import { RollingText } from '../RollingText/RollingText'
import styles from './NavLinks.module.css'

export function NavLinks({ className }: { className?: string }) {
  const { nav } = useContent()
  const localize = useLocalizedPath()
  const links = [
    { to: localize('/psychotherapy'), label: nav.psychotherapy },
    { to: localize('/about'), label: nav.about },
    { to: localize('/contacts'), label: nav.contact },
  ]

  return (
    <ul className={[styles.list, className].filter(Boolean).join(' ')}>
      {links.map(({ to, label }) => (
        <li key={to}>
          <NavLink to={to} className={styles.link}>
            <RollingText text={label} />
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
