import { useRef } from 'react'
import { gsap, useGSAP } from '../../animation/gsap'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import styles from './ConnectorLine.module.css'

interface ConnectorLineProps {
  arrow?: boolean
}

export function ConnectorLine({ arrow = false }: ConnectorLineProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (!ref.current || reducedMotion) return
      gsap.from(ref.current, {
        scaleY: 0,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', end: 'bottom 60%', scrub: true },
      })
    },
    { dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <span ref={ref} className={styles.line} data-arrow={arrow || undefined} aria-hidden="true" />
  )
}
