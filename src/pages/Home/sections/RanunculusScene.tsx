import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { memo, useMemo, useRef, type RefObject } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Points,
  type BufferGeometry,
  type Material,
} from 'three'
import {
  cloneWithOwnMaterials,
  fitModel,
  RANUNCULUS_SETUP,
  STAGE_CAMERA,
} from '../../../three/fitModel'
import { MODELS } from '../../../three/models'

export interface RanunculusSceneProps {
  scaleRef?: RefObject<number>
}

const PETAL_COUNT = 36
const DUST_COUNT = 100

interface PetalState {
  x: number
  y: number
  z: number
  rotX: number
  rotY: number
  rotZ: number
  spinX: number
  spinY: number
  spinZ: number
  speedY: number
  scale: number
  phase: number
}

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function createPetalStates(): PetalState[] {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    x: (seeded(i, 1) - 0.5) * 7,
    y: (i / PETAL_COUNT) * 11 - 5,
    z: (seeded(i, 2) - 0.5) * 4,
    rotX: seeded(i, 3) * Math.PI * 2,
    rotY: seeded(i, 4) * Math.PI * 2,
    rotZ: seeded(i, 5) * Math.PI * 2,
    spinX: (seeded(i, 6) - 0.5) * 1.5,
    spinY: (seeded(i, 7) - 0.5) * 1.5,
    spinZ: (seeded(i, 8) - 0.5) * 1.5,
    speedY: 0.008 + seeded(i, 9) * 0.015,
    scale: 0.7 + seeded(i, 10) * 0.5,
    phase: seeded(i, 11) * Math.PI * 2,
  }))
}

function createDustPositions(): Float32Array {
  const pos = new Float32Array(DUST_COUNT * 3)
  for (let i = 0; i < DUST_COUNT; i++) {
    pos[i * 3] = (seeded(i, 21) - 0.5) * 9
    pos[i * 3 + 1] = (seeded(i, 22) - 0.5) * 9
    pos[i * 3 + 2] = (seeded(i, 23) - 0.5) * 6
  }
  return pos
}

const DUST_POSITIONS = createDustPositions()

function Flower({ scaleRef }: { scaleRef?: RefObject<number> }) {
  const { scene } = useGLTF(MODELS.ranunculus)
  const groupRef = useRef<Group>(null)

  const model = useMemo(() => {
    const copy = cloneWithOwnMaterials(scene)
    fitModel(copy, RANUNCULUS_SETUP)
    return copy
  }, [scene])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    group.rotation.y += delta * 0.12
    if (scaleRef?.current !== undefined) {
      group.scale.setScalar(scaleRef.current)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  )
}

function FallingPetals() {
  const { scene } = useGLTF(MODELS.ranunculus)
  const meshRef = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const petalsRef = useRef<PetalState[]>(createPetalStates())

  const { geometry, material } = useMemo(() => {
    let sourceGeo: BufferGeometry | undefined
    let sourceMat: Material | undefined

    scene.traverse((object) => {
      if (!sourceGeo && object instanceof Mesh && object.name.startsWith('RanunculusPetal')) {
        sourceGeo = object.geometry.clone()
        if (Array.isArray(object.material)) {
          sourceMat = object.material[0].clone()
        } else {
          sourceMat = object.material.clone()
        }
      }
    })

    const finalGeo = sourceGeo ?? new BoxGeometry(0.2, 0.2, 0.02)
    const finalMat =
      sourceMat ??
      new MeshStandardMaterial({
        color: '#b34759',
        roughness: 0.5,
        side: DoubleSide,
      })

    if ('side' in finalMat) {
      finalMat.side = DoubleSide
    }

    return { geometry: finalGeo, material: finalMat }
  }, [scene])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    const petals = petalsRef.current
    if (!mesh || !petals) return
    const step = Math.min(delta, 0.05) * 60

    for (let i = 0; i < PETAL_COUNT; i++) {
      const p = petals[i]
      p.y -= p.speedY * step
      p.rotX += p.spinX * step * 0.02
      p.rotY += p.spinY * step * 0.02
      p.rotZ += p.spinZ * step * 0.02
      p.x += Math.sin(p.phase + p.y * 0.8) * 0.003 * step

      if (p.y < -5.5) {
        p.y = 5.5 + seeded(i, 31) * 2
        p.x = (seeded(i, 32) - 0.5) * 7
        p.z = (seeded(i, 33) - 0.5) * 4
      }

      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geometry, material, PETAL_COUNT]} />
}

function DustPoints() {
  const pointsRef = useRef<Points>(null)

  useFrame((state, delta) => {
    const pts = pointsRef.current
    if (!pts) return
    pts.rotation.y += delta * 0.015
    pts.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[DUST_POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ffffff"
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.7} color="#fffcf7" />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff9f0" />
      <directionalLight position={[-3, -1, 3]} intensity={0.9} color="#f4ebe4" />
      <directionalLight position={[0, 4, -4]} intensity={1.2} color="#ffffff" />
    </>
  )
}

function RanunculusSceneComponent({ scaleRef }: RanunculusSceneProps) {
  return (
    <Canvas
      camera={STAGE_CAMERA}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Lights />
      <Flower scaleRef={scaleRef} />
      <FallingPetals />
      <DustPoints />
    </Canvas>
  )
}

export const RanunculusScene = memo(RanunculusSceneComponent)
