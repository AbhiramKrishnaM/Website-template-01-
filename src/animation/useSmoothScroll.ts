import Lenis from 'lenis'
import { useEffect } from 'react'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'
import { gsap, ScrollTrigger } from './gsap'
import { LENIS_LERP } from './tokens'

let lenis: Lenis | null = null

export function getLenis(): Lenis | null {
  return lenis
}

// Matches the reference: smooth scroll on desktop only, native scroll on touch devices.
export function useSmoothScroll(): void {
  const finePointer = useFinePointer()
  const reducedMotion = useReducedMotion()
  const enabled = finePointer && !reducedMotion

  useEffect(() => {
    if (!enabled) return

    const instance = new Lenis({ lerp: LENIS_LERP })
    const tick = (time: number) => instance.raf(time * 1000)

    instance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    lenis = instance

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [enabled])
}
