import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../animation/gsap'
import { useIntroRevealed } from '../../animation/intro'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'
import { createGlassRenderer, type GlassFrame, type GlassLook } from './glassRenderer'
import styles from './GlassFlower.module.css'

const DEFAULT_LOOK: GlassLook = {
  scale: 1,
  offset: [0, 0],
  radius: 0.19,
  lensLight: 1,
  distortion: 0.018,
  softness: 1,
  grain: 0.06,
  mist: 0.42,
  saturation: 0.86,
  exposure: 1,
  highlightLift: 0.06,
  baseOpacity: 0.86,
  fade: [0.02, 0.22],
}

const HEAD_FOLLOW = 14
const TRAIL_FOLLOW = 2.2
const ENERGY_EASE = 3
const ENERGY_PER_SPEED = 2.5
const HOVER_EASE = 4
const INTRO_SECONDS = 2.6
const STILL_TIME = 2.4

interface GlassFlowerProps {
  src: string
  className?: string
  dissolveOnScroll?: boolean
  dissolve?: { current: number }
  bleed?: number
  look?: Partial<GlassLook>
}

function approach(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt))
}

function idlePath(time: number): [number, number] {
  return [0.5 + 0.16 * Math.sin(time * 0.35), 0.55 + 0.12 * Math.sin(time * 0.7)]
}

export function GlassFlower({
  src,
  className,
  dissolveOnScroll = false,
  dissolve,
  bleed = 0,
  look,
}: GlassFlowerProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ownDissolveRef = useRef(0)
  const dissolveRef = dissolve ?? ownDissolveRef
  const introRef = useRef({ value: 0 })
  const reducedMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const revealed = useIntroRevealed()
  const [fallback, setFallback] = useState(false)
  const lookKey = JSON.stringify(look ?? {})

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const renderer = createGlassRenderer(canvas)
    if (!renderer) {
      setFallback(true)
      return
    }
    renderer.setLook({ ...DEFAULT_LOOK, ...(JSON.parse(lookKey) as Partial<GlassLook>) })

    let visible = false
    let cancelled = false
    const image = new Image()
    image.src = src
    image
      .decode()
      .then(() => {
        if (!cancelled) renderer.setImage(image)
      })
      .catch(() => setFallback(true))

    const resizer = new ResizeObserver(([entry]) =>
      renderer.resize(entry.contentRect.width, entry.contentRect.height),
    )
    resizer.observe(canvas)
    const watcher = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    watcher.observe(wrap)

    const pointer = { x: 0.5, y: 0.5, inside: false }
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) / rect.width
      pointer.y = 1 - (event.clientY - rect.top) / rect.height
      pointer.inside = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1
    }
    const onPointerLeave = () => (pointer.inside = false)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)

    const frame: GlassFrame = {
      time: STILL_TIME,
      head: [0.5, 0.5],
      trail: [0.5, 0.5],
      hover: 0,
      energy: 0,
      intro: 0,
      dissolve: 0,
    }

    const tick = (time: number, deltaMs: number) => {
      if (!visible) return
      const dt = Math.min(deltaMs / 1000, 0.1)
      const target: [number, number] = finePointer ? [pointer.x, pointer.y] : idlePath(time)
      const hoverTarget = finePointer ? (pointer.inside ? 1 : 0) : 0.75

      frame.head = [
        approach(frame.head[0], target[0], HEAD_FOLLOW, dt),
        approach(frame.head[1], target[1], HEAD_FOLLOW, dt),
      ]
      frame.trail = [
        approach(frame.trail[0], frame.head[0], TRAIL_FOLLOW, dt),
        approach(frame.trail[1], frame.head[1], TRAIL_FOLLOW, dt),
      ]
      frame.hover = approach(frame.hover, hoverTarget, HOVER_EASE, dt)
      const speed = Math.hypot(frame.head[0] - frame.trail[0], frame.head[1] - frame.trail[1])
      frame.energy = approach(frame.energy, Math.min(1, speed * ENERGY_PER_SPEED), ENERGY_EASE, dt)
      frame.time = reducedMotion ? STILL_TIME : time
      frame.intro = introRef.current.value
      frame.dissolve = dissolveRef.current
      renderer.render(frame)
    }
    gsap.ticker.add(tick)

    return () => {
      cancelled = true
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      resizer.disconnect()
      watcher.disconnect()
      renderer.dispose()
    }
  }, [src, reducedMotion, finePointer, lookKey, dissolveRef])

  useGSAP(
    () => {
      if (!revealed) return
      const intro = introRef.current
      if (reducedMotion) {
        intro.value = 1
        return
      }
      gsap.fromTo(intro, { value: 0 }, { value: 1, duration: INTRO_SECONDS, ease: 'sine.out' })
    },
    { dependencies: [revealed, reducedMotion, src] },
  )

  useGSAP(
    () => {
      if (!dissolveOnScroll || !wrapRef.current) return
      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => (dissolveRef.current = self.progress),
      })
    },
    { dependencies: [dissolveOnScroll], revertOnUpdate: true },
  )

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={{ '--bleed': `${bleed}px` } as CSSProperties}
    >
      {fallback ? (
        <img src={src} alt="" className={styles.fallback} />
      ) : (
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      )}
    </div>
  )
}
