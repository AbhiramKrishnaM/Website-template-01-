import { cpSync } from 'node:fs'

cpSync('node_modules/three/examples/jsm/libs/draco/gltf', 'public/draco', { recursive: true })
