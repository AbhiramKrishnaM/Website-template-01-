import { Center, Html, OrbitControls, useAnimations, useGLTF, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import { Box3, Mesh, Vector3 } from 'three'
import { MODELS, type ModelName } from '../../three/models'
import styles from './ModelLab.module.css'

const SPACING = 2.6
const FIT_SIZE = 2

function countTriangles(root: Mesh['parent']): number {
  let triangles = 0
  root?.traverse((object) => {
    if (!(object instanceof Mesh)) return
    const { index, attributes } = object.geometry
    triangles += (index ? index.count : attributes.position.count) / 3
  })
  return Math.round(triangles)
}

function Specimen({ name, position }: { name: ModelName; position: [number, number, number] }) {
  const { scene, animations } = useGLTF(MODELS[name])
  const { actions } = useAnimations(animations, scene)

  const scale = useMemo(() => {
    const size = new Box3().setFromObject(scene).getSize(new Vector3())
    return FIT_SIZE / Math.max(size.x, size.y, size.z)
  }, [scene])
  const triangles = useMemo(() => countTriangles(scene), [scene])

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.play())
  }, [actions])

  return (
    <group position={position}>
      <group scale={scale}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
      <Html position={[0, -1.4, 0]} center className={styles.label}>
        <strong>{name}</strong>
        <span>{triangles.toLocaleString()} tris</span>
        <span>{animations.length} clips</span>
      </Html>
    </group>
  )
}

function LoadingStatus() {
  const { active, progress } = useProgress()
  if (!active) return null
  return <p className={styles.status}>Loading models… {Math.round(progress)}%</p>
}

export function ModelLab() {
  const names = Object.keys(MODELS) as ModelName[]
  const offset = ((names.length - 1) * SPACING) / 2

  return (
    <div className={styles.lab}>
      <Canvas camera={{ position: [0, 1, 9], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={2} />
        <Suspense fallback={null}>
          {names.map((name, i) => (
            <Specimen key={name} name={name} position={[i * SPACING - offset, 0, 0]} />
          ))}
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
      <LoadingStatus />
    </div>
  )
}
