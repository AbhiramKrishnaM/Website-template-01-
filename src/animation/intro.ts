import { useSyncExternalStore } from 'react'

export type IntroPhase = 'loading' | 'reveal' | 'done'

const ORDER: Record<IntroPhase, number> = { loading: 0, reveal: 1, done: 2 }

let phase: IntroPhase = 'loading'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getIntroPhase(): IntroPhase {
  return phase
}

export function setIntroPhase(next: IntroPhase): void {
  if (ORDER[next] <= ORDER[phase]) return
  phase = next
  listeners.forEach((listener) => listener())
}

export function hasReached(target: IntroPhase): boolean {
  return ORDER[phase] >= ORDER[target]
}

export function onIntroPhase(target: IntroPhase, callback: () => void): () => void {
  if (hasReached(target)) {
    callback()
    return () => {}
  }
  const listener = () => {
    if (!hasReached(target)) return
    listeners.delete(listener)
    callback()
  }
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useIntroPhase(): IntroPhase {
  return useSyncExternalStore(subscribe, getIntroPhase)
}

export function useIntroRevealed(): boolean {
  return useIntroPhase() !== 'loading'
}
