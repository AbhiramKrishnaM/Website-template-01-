import { Box3, Mesh, Vector3, type Material, type Object3D } from 'three'
import type { ModelName } from './models'

export interface FlowerSetup {
  model: ModelName
  height: number
  top: number
  x: number
  tilt: number
}

const VIEW_HALF_HEIGHT = 2.68

function topAt(fraction: number): number {
  return VIEW_HALF_HEIGHT - fraction * VIEW_HALF_HEIGHT * 2
}

export const FLOWERS: FlowerSetup[] = [
  { model: 'dandelion', height: 4.7, top: topAt(0.33), x: 0, tilt: 0 },
  { model: 'globeThistle', height: 4.5, top: topAt(0.36), x: 0, tilt: 0 },
  { model: 'hydrangea', height: 4.6, top: topAt(0.29), x: 0, tilt: 0.05 },
  { model: 'echinacea', height: 3.9, top: topAt(0.34), x: 0, tilt: 0 },
  { model: 'artichoke', height: 3.8, top: topAt(0.35), x: 0, tilt: 0 },
]

export const STAGE_CAMERA = { position: [0, 0, 10] as [number, number, number], fov: 30 }

export const DANDELION_SEEDS = ['petal-one', 'petal-two', 'petal-three', 'petal-four', 'petal-five']

export function cloneWithOwnMaterials(source: Object3D): Object3D {
  const copy = source.clone(true)
  copy.traverse((object) => {
    if (!(object instanceof Mesh)) return
    object.material = Array.isArray(object.material)
      ? object.material.map((material: Material) => material.clone())
      : (object.material as Material).clone()
  })
  return copy
}

export function fitModel(model: Object3D, setup: FlowerSetup): void {
  model.position.set(0, 0, 0)
  model.scale.setScalar(1)
  model.updateMatrixWorld(true)
  const box = new Box3().setFromObject(model)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  const scale = setup.height / Math.max(size.y, 1e-6)
  model.scale.setScalar(scale)
  model.position.set(-center.x * scale, setup.top - box.max.y * scale, -center.z * scale)
  model.updateMatrixWorld(true)
}

export function collectMaterials(root: Object3D): Material[] {
  const materials = new Set<Material>()
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return
    const list = Array.isArray(object.material) ? object.material : [object.material]
    list.forEach((material: Material) => materials.add(material))
  })
  return [...materials]
}
