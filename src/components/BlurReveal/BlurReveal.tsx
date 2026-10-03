import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../../animation/gsap'
import { useIntroRevealed } from '../../animation/intro'
import { DURATION, EASE } from '../../animation/tokens'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import type { TagName } from '../../lib/polymorphic'

interface BlurRevealProps {
  children: ReactNode
  as?: TagName
  className?: string
  stagger?: number
}

export function BlurReveal({ children, as = 'div', className, stagger = 0.08 }: BlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const revealed = useIntroRevealed()

  useGSAP(
    () => {
      const root = ref.current
      if (!root || reducedMotion || !revealed) return
      gsap.from(root.children, {
        filter: 'blur(8px)',
        autoAlpha: 0,
        y: 20,
        duration: DURATION.slow,
        ease: EASE.out,
        stagger,
        scrollTrigger: { trigger: root, start: 'top 88%' },
      })
    },
    { dependencies: [reducedMotion, revealed, stagger], scope: ref, revertOnUpdate: true },
  )

  const Tag = as as 'div'

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
