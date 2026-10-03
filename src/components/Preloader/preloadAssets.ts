import { MODELS, preloadModels } from '../../three/models'

const FONT_FACES = [
  '300 1em Cormorant',
  '400 1em Cormorant',
  '500 1em Cormorant',
  '300 1em Inter',
  '400 1em Inter',
  '500 1em Inter',
]

const MAX_WAIT_MS = 12000

// Plain fetches warm the HTTP cache with measurable progress; the GLTF preload then decodes from cache.
export async function preloadAssets(onProgress: (ratio: number) => void): Promise<void> {
  const tasks: Promise<unknown>[] = [
    ...FONT_FACES.map((font) => document.fonts.load(font)),
    ...Object.values(MODELS).map((url) => fetch(url).then((response) => response.arrayBuffer())),
  ]

  let finished = 0
  const tracked = tasks.map((task) =>
    task
      .catch(() => undefined)
      .finally(() => {
        finished += 1
        onProgress(finished / tasks.length)
      }),
  )

  const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS))
  await Promise.race([Promise.all(tracked), timeout])
  preloadModels()
}
