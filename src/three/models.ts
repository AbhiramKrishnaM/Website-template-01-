import { useGLTF } from '@react-three/drei'

export const DRACO_PATH = '/draco/'

export const MODELS = {
  dandelion: '/models/dandelion.glb',
  globeThistle: '/models/globe-thistle.glb',
  hydrangea: '/models/hydrangea.glb',
  echinacea: '/models/echinacea.glb',
  artichoke: '/models/artichoke.glb',
  ranunculus: '/models/ranunculus.glb',
} as const

export type ModelName = keyof typeof MODELS

useGLTF.setDecoderPath(DRACO_PATH)

export function preloadModels(): void {
  Object.values(MODELS).forEach((url) => useGLTF.preload(url))
}
