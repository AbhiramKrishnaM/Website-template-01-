import { gsap } from './gsap'

export const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const CYRILLIC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЮЯІЄ'

export type CharState = 'hidden' | 'scrambling' | 'done'

interface ScrambleOptions {
  glyphs?: string
  minSwaps?: number
  maxSwaps?: number
  interval?: number
  end?: CharState
}

export function setCharState(char: HTMLElement, state: CharState): void {
  char.dataset.state = state
}

function setRandomGlyph(char: HTMLElement, glyphs: string) {
  char.dataset.glyph = glyphs[Math.floor(Math.random() * glyphs.length)]
  char.style.setProperty('--clip', `${Math.round(Math.random() * 55)}%`)
}

export function addScramble(
  tl: gsap.core.Timeline,
  char: HTMLElement,
  start: number,
  {
    glyphs = LATIN,
    minSwaps = 4,
    maxSwaps = 8,
    interval = 0.045,
    end = 'done',
  }: ScrambleOptions = {},
): void {
  const swaps = gsap.utils.random(minSwaps, maxSwaps, 1)
  tl.call(setCharState, [char, 'scrambling'], start)
  for (let k = 0; k < swaps; k++) tl.call(setRandomGlyph, [char, glyphs], start + k * interval)
  tl.call(setCharState, [char, end], start + swaps * interval)
}
