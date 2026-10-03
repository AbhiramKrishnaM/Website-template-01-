import { Color, Vector3, type Material } from 'three'

export const INK = new Color('#3d3a37')

// Uniforms shared by every material of one flower. Clip circles are in drawing-buffer pixels (x, y, radius);
// a negative radius disables that clip.
export interface FlowerUniforms {
  uColorMix: { value: number }
  uInk: { value: Color }
  uClipIn: { value: Vector3 }
  uClipOut: { value: Vector3 }
  uWipeEdge: { value: number }
  uWipeGrain: { value: number }
}

export function createFlowerUniforms(): FlowerUniforms {
  return {
    uColorMix: { value: 0 },
    uInk: { value: INK },
    uClipIn: { value: new Vector3(0, 0, -1) },
    uClipOut: { value: new Vector3(0, 0, -1) },
    uWipeEdge: { value: 60 },
    uWipeGrain: { value: 3 },
  }
}

const DECLARATIONS = `
uniform float uColorMix;
uniform vec3 uInk;
uniform vec3 uClipIn;
uniform vec3 uClipOut;
uniform float uWipeEdge;
uniform float uWipeGrain;
`

// The two clips use the same per-grain noise with opposite tests, so the incoming and outgoing flowers
// interleave grain by grain along the wipe edge instead of overlapping.
const CLIP = `
  float wipeNoise = fract(sin(dot(floor(gl_FragCoord.xy / uWipeGrain), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  if (uClipIn.z >= 0.0 && length(gl_FragCoord.xy - uClipIn.xy) - uClipIn.z > wipeNoise * uWipeEdge) discard;
  if (uClipOut.z >= 0.0 && length(gl_FragCoord.xy - uClipOut.xy) - uClipOut.z < wipeNoise * uWipeEdge) discard;
`

// Blends any lit material (textured too) from an ink-toned monochrome (0) to its natural colours (1),
// and clips it to the slide wipe circles.
const MONOCHROME = `
  float monoLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
  diffuseColor.rgb = mix(uInk * (0.35 + 0.9 * monoLuma), diffuseColor.rgb, uColorMix);
`

export function patchFlowerMaterial(material: Material, uniforms: FlowerUniforms): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${DECLARATIONS}`)
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>\n${CLIP}`,
      )
      .replace('#include <map_fragment>', `#include <map_fragment>\n${MONOCHROME}`)
  }
  material.customProgramCacheKey = () => 'flower'
  material.needsUpdate = true
}
