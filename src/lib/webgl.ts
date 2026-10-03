import fullscreenVert from '../shaders/fullscreen.vert?raw'

export const MAX_DPR = 1.5

export interface QuadProgram {
  gl: WebGLRenderingContext
  uniform: (name: string) => WebGLUniformLocation | null
  draw: () => void
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

export function createQuadProgram(
  canvas: HTMLCanvasElement,
  fragmentSource: string,
): QuadProgram | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
  if (!gl) return null

  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, fullscreenVert))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource))
  gl.linkProgram(program)
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  return {
    gl,
    uniform: (name) => gl.getUniformLocation(program, name),
    draw: () => {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose: () => {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    },
  }
}

export function cssColor(name: string): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim().slice(1)
  const value = parseInt(hex, 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}
