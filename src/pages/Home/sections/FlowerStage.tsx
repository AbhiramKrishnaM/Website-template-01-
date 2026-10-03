import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { AnimationMixer, Box3, Group, Vector3, type AnimationClip, type Object3D } from 'three'
import { useReducedMotion } from '../../../hooks/useMediaQuery'
import {
  cloneWithOwnMaterials,
  collectMaterials,
  DANDELION_SEEDS,
  FLOWERS,
  fitModel,
  STAGE_CAMERA,
  type FlowerSetup,
} from '../../../three/fitModel'
import { MODELS } from '../../../three/models'
import { createFlowerUniforms, patchFlowerMaterial } from '../../../three/monochrome'
import { seedFlight } from '../../../three/seedFlight'
import { StageLights } from '../../../three/StageLights'
import styles from './Cards.module.css'

export interface CardsClock {
  time: number
}

// A wipe circle in the stage canvas's drawing-buffer pixels (origin bottom-left, like gl_FragCoord).
interface WipeCircle {
  x: number
  y: number
  radius: number
}

// Timeline units per slide (matches Cards): the wipe into slide i starts at 2(i-1) and takes 1 unit.
const UNITS_PER_SLIDE = 2
const WIPE_EDGE_PX = 60
const WIPE_GRAIN_PX = 3
const BLOOM_AFTER = 0.5
const BLOOM_LENGTH = 1
const COLOR_AFTER = 1
const COLOR_LENGTH = 0.8
const FIRST_COLOR = [0.05, 0.6]
const HOLD_SPIN = 0.3
const HIT_RADIUS = 0.35
const SHAKE_STIFFNESS = 60
const SHAKE_DAMPING = 7
const SHAKE_KICK = 6

const CIRCLE_PATTERN = /circle\(([\d.]+)px at ([\d.-]+)px ([\d.-]+)px\)/

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function clipLength(clips: AnimationClip[]): number {
  return clips.reduce((longest, clip) => Math.max(longest, clip.duration), 0)
}

function wipeStart(index: number): number {
  return UNITS_PER_SLIDE * (index - 1)
}

function useFittedModel(setup: FlowerSetup) {
  const { scene, animations } = useGLTF(MODELS[setup.model])
  return useMemo(() => {
    const model = cloneWithOwnMaterials(scene)
    fitModel(model, setup)
    const uniforms = createFlowerUniforms()
    collectMaterials(model).forEach((material) => patchFlowerMaterial(material, uniforms))
    const mixer = new AnimationMixer(model)
    const actions = animations.map((clip) => mixer.clipAction(clip).play())
    const box = new Box3().setFromObject(model)
    const head = new Vector3(
      (box.min.x + box.max.x) / 2,
      box.max.y - (box.max.y - box.min.y) * 0.12,
      (box.min.z + box.max.z) / 2,
    )
    const seeds =
      setup.model === 'dandelion'
        ? DANDELION_SEEDS.map((name) => model.getObjectByName(name)).filter(
            (seed): seed is Object3D => seed !== undefined,
          )
        : []
    return { model, mixer, actions, duration: clipLength(animations), uniforms, head, seeds }
  }, [scene, animations, setup])
}

function WipeTracker({ onWipes }: { onWipes: (wipes: (WipeCircle | null)[]) => void }) {
  useFrame(({ gl }) => {
    const canvas = gl.domElement
    const canvasRect = canvas.getBoundingClientRect()
    const dpr = canvas.width / Math.max(1, canvasRect.width)
    const fills = canvas.closest('[data-sticky]')?.querySelectorAll<HTMLElement>('[data-fill]')
    const circles = [...(fills ?? [])].map((fill) => {
      const match = CIRCLE_PATTERN.exec(fill.style.clipPath)
      const area = fill.parentElement?.getBoundingClientRect()
      if (!match || !area) return null
      const [, radius, x, y] = match.map(Number)
      return {
        x: (area.left + x - canvasRect.left) * dpr,
        y: (canvasRect.bottom - (area.top + y)) * dpr,
        radius: radius * dpr,
      }
    })
    onWipes(circles)
  }, -1)
  return null
}

function Flower({
  setup,
  index,
  clock,
  wipes,
}: {
  setup: FlowerSetup
  index: number
  clock: RefObject<CardsClock>
  wipes: RefObject<(WipeCircle | null)[]>
}) {
  const fitted = useFittedModel(setup)
  const fittedRef = useRef(fitted)
  const groupRef = useRef<Group>(null)
  const shake = useRef({ angle: 0, velocity: 0, lastX: 0, lastY: 0 })
  const reducedMotion = useReducedMotion()
  const last = FLOWERS.length - 1

  useEffect(() => {
    fittedRef.current = fitted
  }, [fitted])

  useFrame(({ camera, pointer, size, gl }, delta) => {
    const group = groupRef.current
    if (!group) return
    const { mixer, actions, duration, uniforms, head, seeds } = fittedRef.current
    const time = clock.current.time
    const start = wipeStart(index)
    const visible =
      (index === 0 || time > start + 1e-3) && (index === last || time < wipeStart(index + 1) + 1)
    group.visible = visible
    if (!visible) return

    const landed = seedFlight.progress >= 0.999
    seeds.forEach((seed) => (seed.visible = landed))

    const dpr = gl.domElement.width / Math.max(1, size.width)
    uniforms.uWipeEdge.value = WIPE_EDGE_PX * dpr
    uniforms.uWipeGrain.value = WIPE_GRAIN_PX * dpr
    const into = index > 0 ? wipes.current[index - 1] : null
    const outOf = index < last ? wipes.current[index] : null
    uniforms.uClipIn.value.set(into?.x ?? 0, into?.y ?? 0, into ? into.radius : -1)
    uniforms.uClipOut.value.set(outOf?.x ?? 0, outOf?.y ?? 0, outOf ? outOf.radius : -1)

    uniforms.uColorMix.value =
      index === 0
        ? smoothstep(FIRST_COLOR[0], FIRST_COLOR[1], time)
        : smoothstep(start + COLOR_AFTER, start + COLOR_AFTER + COLOR_LENGTH, time)

    // Scrub by setting each clip's time and evaluating without advancing; a clip is kept just short of its end
    // so it never reaches "finished", which would pause it.
    if (duration > 0) {
      const bloom = smoothstep(start + BLOOM_AFTER, start + BLOOM_AFTER + BLOOM_LENGTH, time)
      actions.forEach((action) => {
        action.time = Math.min(bloom * duration, action.getClip().duration - 1e-4)
      })
      mixer.update(0)
    }

    // Hovering the head kicks a damped spring, so the flower shakes and settles.
    const wobble = shake.current
    if (!reducedMotion) {
      const projected = head.clone().applyMatrix4(group.matrixWorld).project(camera)
      const aspect = size.width / Math.max(1, size.height)
      const near =
        Math.hypot((pointer.x - projected.x) * aspect, pointer.y - projected.y) < HIT_RADIUS
      const moved = Math.hypot(pointer.x - wobble.lastX, pointer.y - wobble.lastY)
      if (near && moved > 0)
        wobble.velocity += moved * SHAKE_KICK * Math.sign(pointer.x - wobble.lastX || 1)
      wobble.lastX = pointer.x
      wobble.lastY = pointer.y
      const dt = Math.min(delta, 0.05)
      wobble.velocity += (-SHAKE_STIFFNESS * wobble.angle - SHAKE_DAMPING * wobble.velocity) * dt
      wobble.angle += wobble.velocity * dt
    }

    // The dandelion holds still until its seeds have landed, so the hand-off from the seed overlay is exact.
    const holdFrom = index === 0 ? 0 : start + 1
    const hold = index === 0 && !landed ? 0 : Math.max(0, time - holdFrom)
    group.position.x = setup.x
    group.rotation.set(wobble.angle * 0.4, hold * HOLD_SPIN, setup.tilt + wobble.angle)
  })

  return (
    <group ref={groupRef}>
      <primitive object={fitted.model} />
    </group>
  )
}

export function FlowerStage({ clock }: { clock: RefObject<CardsClock> }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const wipesRef = useRef<(WipeCircle | null)[]>([])
  const storeWipes = useCallback((wipes: (WipeCircle | null)[]) => {
    wipesRef.current = wipes
  }, [])
  const [active, setActive] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const watcher = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting))
    watcher.observe(stage)
    return () => watcher.disconnect()
  }, [])

  return (
    <div ref={stageRef} className={styles.stage} data-stage aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={STAGE_CAMERA}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <StageLights />
        <WipeTracker onWipes={storeWipes} />
        <Suspense fallback={null}>
          {FLOWERS.map((setup, i) => (
            <Flower key={setup.model} setup={setup} index={i} clock={clock} wipes={wipesRef} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
