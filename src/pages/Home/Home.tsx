import { lazy, Suspense } from 'react'
import { Cards } from './sections/Cards'
import { Hero } from './sections/Hero'
import { Intro } from './sections/Intro'

const SeedFlight = lazy(() =>
  import('./sections/SeedFlight').then((module) => ({ default: module.SeedFlight })),
)

export function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Cards />
      <Suspense>
        <SeedFlight />
      </Suspense>
    </>
  )
}
