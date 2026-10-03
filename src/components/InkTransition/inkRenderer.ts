import { createQuadProgram, cssColor, MAX_DPR } from '../../lib/webgl'
import inkFrag from '../../shaders/ink.frag?raw'

export const CORNER: [number, number] = [-0.16, -0.16]

export interface InkRenderer {
  render: (progress: number, seed: number, origin?: [number, number]) => void
  resize: () => void
  dispose: () => void
}

export function createInkRenderer(canvas: HTMLCanvasElement): InkRenderer | null {
  const quad = createQuadProgram(canvas, inkFrag)
  if (!quad) return null
  const { gl, uniform } = quad

  gl.uniform3fv(uniform('uPaper'), cssColor('--bg-cream'))
  gl.uniform3fv(uniform('uTide'), cssColor('--tide'))

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, MAX_DPR)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniform('uResolution'), canvas.width, canvas.height)
  }

  const render = (progress: number, seed: number, origin: [number, number] = CORNER) => {
    gl.uniform1f(uniform('uProgress'), progress)
    gl.uniform1f(uniform('uSeed'), seed)
    gl.uniform2f(uniform('uOrigin'), origin[0], origin[1])
    quad.draw()
  }

  resize()
  render(0, 0)

  return { render, resize, dispose: quad.dispose }
}
