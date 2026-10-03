import inkFrag from '../../shaders/ink.frag?raw'
import fullscreenVert from '../../shaders/fullscreen.vert?raw'

const MAX_DPR = 1.5
export const CORNER: [number, number] = [-0.16, -0.16]

export interface InkRenderer {
  render: (progress: number, seed: number, origin?: [number, number]) => void
  resize: () => void
  dispose: () => void
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Could not create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compile failed')
  }
  return shader
}

function cssColor(name: string): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim().slice(1)
  const value = parseInt(hex, 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

export function createInkRenderer(canvas: HTMLCanvasElement): InkRenderer | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
  if (!gl) return null

  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, fullscreenVert))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, inkFrag))
  gl.linkProgram(program)
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uniforms = {
    resolution: gl.getUniformLocation(program, 'uResolution'),
    progress: gl.getUniformLocation(program, 'uProgress'),
    seed: gl.getUniformLocation(program, 'uSeed'),
    origin: gl.getUniformLocation(program, 'uOrigin'),
    paper: gl.getUniformLocation(program, 'uPaper'),
    tide: gl.getUniformLocation(program, 'uTide'),
  }
  gl.uniform3fv(uniforms.paper, cssColor('--bg-cream'))
  gl.uniform3fv(uniforms.tide, cssColor('--tide'))

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, MAX_DPR)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
  }

  const render = (progress: number, seed: number, origin: [number, number] = CORNER) => {
    gl.uniform1f(uniforms.progress, progress)
    gl.uniform1f(uniforms.seed, seed)
    gl.uniform2f(uniforms.origin, origin[0], origin[1])
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  resize()
  render(0, 0)

  return {
    render,
    resize,
    dispose: () => {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    },
  }
}
