import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '../../animation/gsap'
import { useIntroRevealed } from '../../animation/intro'
import { DURATION, EASE } from '../../animation/tokens'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'
import styles from './RoundButton.module.css'

const MAGNET_STRENGTH = 0.25
const MAGNET_MAX = 10

interface RoundButtonProps {
  children: ReactNode
  to?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
}

export function RoundButton({
  children,
  to,
  type = 'button',
  onClick,
  className,
}: RoundButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const finePointer = useFinePointer()
  const reducedMotion = useReducedMotion()
  const revealed = useIntroRevealed()

  useGSAP(
    () => {
      const wrap = ref.current
      if (!wrap || reducedMotion || !revealed) return

      gsap.from(wrap, {
        scale: 0.6,
        autoAlpha: 0,
        duration: DURATION.slow,
        ease: EASE.expo,
        scrollTrigger: { trigger: wrap, start: 'top 92%' },
      })

      if (!finePointer) return
      const target = wrap.firstElementChild as HTMLElement
      const moveX = gsap.quickTo(target, 'x', { duration: 0.6, ease: EASE.out })
      const moveY = gsap.quickTo(target, 'y', { duration: 0.6, ease: EASE.out })
      const clamp = gsap.utils.clamp(-MAGNET_MAX, MAGNET_MAX)

      const onMove = (event: PointerEvent) => {
        const rect = target.getBoundingClientRect()
        moveX(clamp((event.clientX - rect.left - rect.width / 2) * MAGNET_STRENGTH))
        moveY(clamp((event.clientY - rect.top - rect.height / 2) * MAGNET_STRENGTH))
      }
      const onLeave = () => {
        moveX(0)
        moveY(0)
      }

      wrap.addEventListener('pointermove', onMove)
      wrap.addEventListener('pointerleave', onLeave)
      return () => {
        wrap.removeEventListener('pointermove', onMove)
        wrap.removeEventListener('pointerleave', onLeave)
      }
    },
    { dependencies: [finePointer, reducedMotion, revealed], scope: ref, revertOnUpdate: true },
  )

  const classes = [styles.button, className].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={styles.wrap}>
      {to ? (
        <Link to={to} className={classes}>
          {children}
        </Link>
      ) : (
        <button type={type} onClick={onClick} className={classes}>
          {children}
        </button>
      )}
    </div>
  )
}
