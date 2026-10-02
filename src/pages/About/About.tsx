import { useContent } from '../../content/useContent'

export function About() {
  const { pages } = useContent()
  return <h1>{pages.about.title}</h1>
}
