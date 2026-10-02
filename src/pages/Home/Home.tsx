import { useContent } from '../../content/useContent'

export function Home() {
  const { pages } = useContent()
  return <h1>{pages.home.title}</h1>
}
