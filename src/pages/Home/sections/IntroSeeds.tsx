import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Box3, Group, Mesh, MeshBasicMaterial, Vector3, type Material } from 'three'
import { useReducedMotion } from '../../../hooks/useMediaQuery'
import { MODELS } from '../../../three/models'
import styles from './Intro.module.css'

const SEED_NAMES = ['petal-one', 'petal-two', 'petal-three', 'petal-four', 'petal-five']
const SEED_SIZE = 150

const INK: Record<string, { color: string; opacity: number }> = {
  white: { color: '#4a4744', opacity: 0.85 },
  green: { color: '#3d3b38', opacity: 1 },
  brown: { color: '#2a2826', opacity: 1 },
}

// Placement in the layer: x across the width, y down the layer's height (which starts one screen above the section),
// speed < 1 drifts slower than the page for depth.
interface SeedSpot {
  x: number
  y: number
  speed: number
  scale: number
  tilt: number
  variant: number
}

const SPOTS: SeedSpot[] = [
  { x: 0.28, y: 0.3, speed: 0.85, scale: 1, tilt: 0.3, variant: 0 },
  { x: 0.5, y: 0.26, speed: 0.95, scale: 0.9, tilt: -0.1, variant: 1 },
  { x: 0.7, y: 0.33, speed: 0.8, scale: 1.05, tilt: -0.5, variant: 2 },
  { x: 0.24, y: 0.5, speed: 0.9, scale: 0.85, tilt: 0.2, variant: 3 },
  { x: 0.75, y: 0.52, speed: 1.05, scale: 0.95, tilt: 0.4, variant: 4 },
  { x: 0.33, y: 0.66, speed: 0.92, scale: 1.1, tilt: -0.2, variant: 0 },
  { x: 0.62, y: 0.71, speed: 0.82, scale: 0.9, tilt: 0.35, variant: 2 },
  { x: 0.42, y: 0.86, speed: 1, scale: 1, tilt: -0.4, variant: 1 },
  { x: 0.72, y: 0.9, speed: 0.88, scale: 0.8, tilt: 0.1, variant: 3 },
]

function inkMaterial(source: Material): MeshBasicMaterial {
  const ink = INK[source.name] ?? INK.green
  return new MeshBasicMaterial({
    color: ink.color,
    transparent: ink.opacity < 1,
    opacity: ink.opacity,
    depthWrite: ink.opacity === 1,
  })
}

function useSeedVariants(): Group[] {
  const { scene } = useGLTF(MODELS.dandelion)
  return useMemo(
    () =>
      SEED_NAMES.map((name) => {
        const seed = scene.getObjectByName(name)?.clone(true) ?? new Group()
        seed.traverse((object) => {
          if (object instanceof Mesh) object.material = inkMaterial(object.material as Material)
        })
        const box = new Box3().setFromObject(seed)
        const size = box.getSize(new Vector3())
        seed.position.sub(box.getCenter(new Vector3()))
        const holder = new Group()
        holder.add(seed)
        holder.scale.setScalar(SEED_SIZE / Math.max(size.x, size.y, size.z, 1e-6))
        return holder
      }),
    [scene],
  )
}

function Seeds({ layerRef }: { layerRef: RefObject<HTMLDivElement | null> }) {
  const variants = useSeedVariants()
  const seeds = useMemo(
    () =>
      SPOTS.map((spot) => {
        const object = variants[spot.variant].clone(true)
        object.scale.multiplyScalar(spot.scale)
        return object
      }),
    [variants],
  )
  const phases = useMemo(() => SPOTS.map((_, i) => i * 1.7), [])
  const { size } = useThree()
  const reducedMotion = useReducedMotion()

  useFrame(({ clock }) => {
    const layer = layerRef.current
    if (!layer) return
    const rect = layer.getBoundingClientRect()
    const time = reducedMotion ? 0 : clock.elapsedTime

    seeds.forEach((seed, i) => {
      const spot = SPOTS[i]
      const phase = phases[i]
      const screenX = spot.x * size.width + Math.sin(time * 0.35 + phase) * 28
      const screenY =
        spot.y * rect.height + rect.top * spot.speed + Math.sin(time * 0.6 + phase) * 14
      seed.position.set(screenX - size.width / 2, size.height / 2 - screenY, 0)
      seed.rotation.set(0, time * 0.18 + phase, spot.tilt + Math.sin(time * 0.5 + phase) * 0.2)
    })
  })

  return seeds.map((seed, i) => <primitive key={i} object={seed} />)
}

export function IntroSeeds() {
  const layerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    const watcher = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting))
    watcher.observe(layer)
    return () => watcher.disconnect()
  }, [])

  return (
    <div ref={layerRef} className={styles.seedLayer} aria-hidden="true">
      <div className={styles.seedStage}>
        <Canvas
          orthographic
          frameloop={active ? 'always' : 'never'}
          camera={{ position: [0, 0, 500], zoom: 1, near: 1, far: 2000 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
        >
          <Suspense fallback={null}>
            <Seeds layerRef={layerRef} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
