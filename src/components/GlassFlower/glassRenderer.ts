import { createQuadProgram, cssColor, MAX_DPR } from '../../lib/webgl'
import glassFrag from '../../shaders/glass.frag?raw'

export interface GlassLook {
  scale: number
  offset: [number, number]
  radius: number
  lensLight: number
  distortion: number
  softness: number
  grain: number
  mist: number
  saturation: number
  exposure: number
  highlightLift: number
  baseOpacity: number
  fade: [number, number]
}

export interface GlassFrame {
  time: number
  head: [number, number]
  trail: [number, number]
  hover: number
  energy: number
  intro: number
  dissolve: number
}

export interface GlassRenderer {
  setImage: (image: HTMLImageElement) => void
  setLook: (look: GlassLook) => void
  resize: (width: number, height: number) => void
  render: (frame: GlassFrame) => void
  dispose: () => void
}

export function createGlassRenderer(canvas: HTMLCanvasElement): GlassRenderer | null {
  const quad = createQuadProgram(canvas, glassFrag)
  if (!quad) return null
  const { gl, uniform } = quad

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.uniform1i(uniform('uTexture'), 0)
  gl.uniform3fv(uniform('uPaper'), cssColor('--bg-cream'))

  let hasImage = false

  return {
    setImage: (image) => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.uniform2f(uniform('uImageSize'), image.naturalWidth, image.naturalHeight)
      hasImage = true
    },
    setLook: (look) => {
      gl.uniform1f(uniform('uScale'), look.scale)
      gl.uniform2fv(uniform('uOffset'), look.offset)
      gl.uniform1f(uniform('uRadius'), look.radius)
      gl.uniform1f(uniform('uLensLight'), look.lensLight)
      gl.uniform1f(uniform('uDistortion'), look.distortion)
      gl.uniform1f(uniform('uSoftness'), look.softness)
      gl.uniform1f(uniform('uGrain'), look.grain)
      gl.uniform1f(uniform('uMist'), look.mist)
      gl.uniform1f(uniform('uSaturation'), look.saturation)
      gl.uniform1f(uniform('uExposure'), look.exposure)
      gl.uniform1f(uniform('uHighlightLift'), look.highlightLift)
      gl.uniform1f(uniform('uBaseOpacity'), look.baseOpacity)
      gl.uniform2fv(uniform('uFade'), look.fade)
    },
    resize: (width, height) => {
      const dpr = Math.min(window.devicePixelRatio, MAX_DPR)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uniform('uResolution'), canvas.width, canvas.height)
    },
    render: (frame) => {
      if (!hasImage) return
      gl.uniform1f(uniform('uTime'), frame.time)
      gl.uniform2fv(uniform('uHead'), frame.head)
      gl.uniform2fv(uniform('uTrail'), frame.trail)
      gl.uniform1f(uniform('uHover'), frame.hover)
      gl.uniform1f(uniform('uEnergy'), frame.energy)
      gl.uniform1f(uniform('uIntro'), frame.intro)
      gl.uniform1f(uniform('uDissolve'), frame.dissolve)
      quad.draw()
    },
    dispose: () => {
      gl.deleteTexture(texture)
      quad.dispose()
    },
  }
}
