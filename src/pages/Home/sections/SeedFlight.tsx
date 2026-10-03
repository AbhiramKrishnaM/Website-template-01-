import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Box3, Group, PerspectiveCamera, Quaternion, Vector3, type Object3D } from 'three'
import { useReducedMotion } from '../../../hooks/useMediaQuery'
import {
  cloneWithOwnMaterials,
  collectMaterials,
  DANDELION_SEEDS,
  FLOWERS,
  fitModel,
  STAGE_CAMERA,
} from '../../../three/fitModel'
import { MODELS } from '../../../three/models'
import { createFlowerUniforms, patchFlowerMaterial } from '../../../three/monochrome'
import { seedFlight } from '../../../three/seedFlight'
import { StageLights } from '../../../three/StageLights'
import styles from './SeedFlight.module.css'

interface Spot {
  x: number
  y: number
  enter: number
  sink: number
  tilt: number
  variant: number
  lands: boolean
  flyFrom: number
}

const SPOTS: Spot[] = [
  { x: 0.26, y: 0.22, enter: 0, sink: 0.3, tilt: 0.25, variant: 0, lands: true, flyFrom: 0.62 },
  {
    x: 0.74,
    y: 0.18,
    enter: 0.04,
    sink: 0.25,
    tilt: -0.35,
    variant: 1,
    lands: true,
    flyFrom: 0.66,
  },
  { x: 0.33, y: 0.55, enter: 0.08, sink: 0.3, tilt: 0.45, variant: 2, lands: true, flyFrom: 0.7 },
  { x: 0.66, y: 0.62, enter: 0.12, sink: 0.25, tilt: -0.5, variant: 3, lands: true, flyFrom: 0.74 },
  { x: 0.5, y: 0.35, enter: 0.06, sink: 0.35, tilt: 0.1, variant: 4, lands: true, flyFrom: 0.78 },
  { x: 0.82, y: 0.45, enter: 0.1, sink: 1.4, tilt: -0.2, variant: 2, lands: false, flyFrom: 1 },
  { x: 0.16, y: 0.7, enter: 0.14, sink: 1.5, tilt: 0.35, variant: 0, lands: false, flyFrom: 1 },
]

const LEAD_SCREENS = 0.4
const ENTRY_LENGTH = 0.18
const ABOVE_SCREEN_PX = 220

interface SeedModel {
  holder: Group
  attach: Vector3
  upright: Quaternion[]
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function useSeedModels(): SeedModel[] {
  const { scene } = useGLTF(MODELS.dandelion)
  return useMemo(() => {
    const dandelion = cloneWithOwnMaterials(scene)
    fitModel(dandelion, FLOWERS[0])
    const uniforms = createFlowerUniforms()
    collectMaterials(dandelion).forEach((material) => patchFlowerMaterial(material, uniforms))
    const head = dandelion.getObjectByName('Dandelion') ?? dandelion
    const headCenter = new Box3().setFromObject(head).getCenter(new Vector3())

    return DANDELION_SEEDS.map((name) => {
      const source = dandelion.getObjectByName(name) as Object3D
      const piece = source.clone(true)
      source.matrixWorld.decompose(piece.position, piece.quaternion, piece.scale)
      const attach = new Box3().setFromObject(piece).getCenter(new Vector3())
      piece.position.sub(attach)
      const holder = new Group()
      holder.add(piece)
      const outward = attach.clone().sub(headCenter).normalize()
      const upright = SPOTS.map((spot) =>
        new Quaternion().setFromUnitVectors(
          outward,
          new Vector3(Math.sin(spot.tilt), Math.cos(spot.tilt), 0).normalize(),
        ),
      )
      return { holder, attach, upright }
    })
  }, [scene])
}

function screenToPlane(camera: PerspectiveCamera, x: number, y: number, z: number, out: Vector3) {
  out.set(x, y, 0.5).unproject(camera).sub(camera.position)
  return out.multiplyScalar((z - camera.position.z) / out.z).add(camera.position)
}

function Seeds() {
  const models = useSeedModels()
  const seeds = useMemo(
    () =>
      SPOTS.map((spot, i) => {
        const model = models[spot.variant]
        return { holder: model.holder.clone(true), attach: model.attach, upright: model.upright[i] }
      }),
    [models],
  )
  const reducedMotion = useReducedMotion()
  const scratch = useMemo(
    () => ({ drift: new Vector3(), tilt: new Quaternion(), axis: new Vector3(0, 0, 1) }),
    [],
  )

  useFrame(({ clock, camera, size }) => {
    const intro = document.querySelector<HTMLElement>('[data-seed-start]')
    const cards = document.querySelector<HTMLElement>('[data-seed-land]')
    const stage = document.querySelector<HTMLElement>('[data-stage]')
    if (!intro || !cards) return

    const scroll = window.scrollY
    const introRect = intro.getBoundingClientRect()
    const introTop = introRect.top + scroll
    const start = introTop - size.height * (1 + LEAD_SCREENS)
    const end = cards.getBoundingClientRect().top + scroll
    const u = Math.min(1, Math.max(0, (scroll - start) / Math.max(1, end - start)))
    const canLand = stage !== null
    seedFlight.progress = canLand ? u : 0

    const view = camera as PerspectiveCamera
    if (stage) {
      const rect = stage.getBoundingClientRect()
      view.aspect = rect.width / rect.height
      view.setViewOffset(rect.width, rect.height, -rect.left, -rect.top, size.width, size.height)
    }
    view.updateProjectionMatrix()
    view.updateMatrixWorld()

    const time = reducedMotion ? 0 : clock.elapsedTime
    seeds.forEach((seed, i) => {
      const spot = SPOTS[i]
      const phase = i * 1.9
      const screenX = spot.x * size.width + Math.sin(time * 0.35 + phase) * 24
      const entry = smoothstep(spot.enter, spot.enter + ENTRY_LENGTH, u)
      const sinking = Math.max(0, u - spot.enter - ENTRY_LENGTH) * spot.sink * size.height
      const restY = spot.y * size.height
      const startY = -ABOVE_SCREEN_PX - i * 40
      const screenY =
        startY + (restY - startY) * entry + sinking + Math.sin(time * 0.6 + phase) * 10 * entry
      screenToPlane(
        view,
        (screenX / size.width) * 2 - 1,
        -(screenY / size.height) * 2 + 1,
        seed.attach.z,
        scratch.drift,
      )

      const flight = spot.lands && canLand ? smoothstep(spot.flyFrom, 1, u) : 0
      seed.holder.visible = u > 0 && !(spot.lands && canLand && u >= 0.999)
      seed.holder.position.lerpVectors(scratch.drift, seed.attach, flight)
      seed.holder.position.y += Math.sin(flight * Math.PI) * 0.35

      scratch.tilt.setFromAxisAngle(
        scratch.axis,
        Math.sin(time * 0.5 + phase) * 0.15 * (1 - flight),
      )
      seed.holder.quaternion.copy(scratch.tilt).multiply(seed.upright)
      seed.holder.quaternion.slerp(new Quaternion(), flight)
    })
  })

  return seeds.map((seed, i) => <primitive key={i} object={seed.holder} />)
}

export function SeedFlight() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const intro = document.querySelector('[data-seed-start]')
    if (!intro) return
    const watcher = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: '100% 0px 100% 0px',
    })
    watcher.observe(intro)
    return () => watcher.disconnect()
  }, [])

  return (
    <div className={styles.overlay} data-active={active || undefined} aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={STAGE_CAMERA}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <StageLights />
        <Suspense fallback={null}>
          <Seeds />
        </Suspense>
      </Canvas>
    </div>
  )
}
