import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { gsap } from '../../animation/gsap'
import { hasReached } from '../../animation/intro'
import { getLenis } from '../../animation/useSmoothScroll'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { createInkRenderer, type InkRenderer } from './inkRenderer'
import styles from './InkTransition.module.css'

// Matches the reference: a 5.6s round trip (5.4s on phones), split evenly between cover and reveal.
const TOTAL_SECONDS = 5.6
const TOTAL_SECONDS_MOBILE = 5.4
const UNLOCK_BEFORE_END_SECONDS = 1
const FADE_SECONDS = 0.3
const REVEAL_DELAY_SECONDS = 0.05

function halfDuration(): number {
  return (
    (window.matchMedia('(max-width: 48rem)').matches ? TOTAL_SECONDS_MOBILE : TOTAL_SECONDS) / 2
  )
}

function internalTarget(event: MouseEvent): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
  const anchor = (event.target as Element | null)?.closest('a')
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return null
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return null
  return url
}

function finished(animation: gsap.core.Animation): Promise<void> {
  return new Promise((resolve) => animation.then(() => resolve()))
}

interface InkState {
  progress: number
  seed: number
}

type Phase = 'idle' | 'cover' | 'reveal' | 'tail'

function animateInk(
  state: InkState,
  canvas: HTMLCanvasElement | null,
  renderer: InkRenderer | null,
  reducedMotion: boolean,
  to: number,
  seconds: number,
  ease: string,
): Promise<void> {
  if (!canvas) return Promise.resolve()
  const flat = reducedMotion || !renderer
  if (flat) renderer?.render(1, state.seed)

  const draw = () => {
    if (flat) {
      canvas.style.opacity = String(state.progress)
      return
    }
    canvas.style.opacity = '1'
    renderer.render(state.progress, state.seed)
  }
  draw()

  return finished(
    gsap.to(state, {
      progress: to,
      overwrite: true,
      duration: flat ? FADE_SECONDS : seconds,
      ease: flat ? 'none' : ease,
      onUpdate: draw,
    }),
  )
}

export function InkTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<InkRenderer | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const runRef = useRef(0)
  const inkRef = useRef<InkState>({ progress: 0, seed: 0 })
  const pendingRevealRef = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const reducedMotionRef = useRef(reducedMotion)

  useEffect(() => {
    reducedMotionRef.current = reducedMotion
  }, [reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = createInkRenderer(canvas)
    rendererRef.current = renderer
    if (!renderer) canvas.dataset.fallback = ''
    const onResize = () => renderer?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      renderer?.dispose()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    const onClick = async (event: MouseEvent) => {
      const url = internalTarget(event)
      if (!url) return
      const samePage = url.pathname === window.location.pathname
      if (samePage && url.hash) return
      event.preventDefault()
      const phase = phaseRef.current
      if (samePage || phase === 'cover' || phase === 'reveal' || !hasReached('done')) return

      // A click during the reveal's tail continues from the ink already on screen.
      runRef.current += 1
      phaseRef.current = 'cover'
      const ink = inkRef.current
      if (ink.progress === 0) ink.seed = Math.random() * 100
      canvasRef.current?.setAttribute('data-active', '')
      getLenis()?.stop()
      await animateInk(
        ink,
        canvasRef.current,
        rendererRef.current,
        reducedMotionRef.current,
        1,
        halfDuration() * (1 - ink.progress),
        'sine.in',
      )
      pendingRevealRef.current = true
      navigate(url.pathname + url.search + url.hash)
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [navigate])

  useEffect(() => {
    if (!pendingRevealRef.current) return
    pendingRevealRef.current = false

    const run = ++runRef.current
    const release = () => {
      getLenis()?.start()
      canvasRef.current?.removeAttribute('data-active')
    }
    const reveal = async () => {
      phaseRef.current = 'reveal'
      inkRef.current.seed += 1
      const seconds = halfDuration()
      const tail = gsap.delayedCall(Math.max(0, seconds - UNLOCK_BEFORE_END_SECONDS), () => {
        if (runRef.current !== run) return
        phaseRef.current = 'tail'
        release()
      })
      await animateInk(
        inkRef.current,
        canvasRef.current,
        rendererRef.current,
        reducedMotionRef.current,
        0,
        seconds,
        'sine.out',
      )
      tail.kill()
      if (runRef.current !== run) return
      phaseRef.current = 'idle'
      release()
    }
    gsap.delayedCall(REVEAL_DELAY_SECONDS, reveal)
  }, [location.key])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
