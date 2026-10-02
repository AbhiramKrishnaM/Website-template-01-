import { useContent } from '../../content/useContent'

export function Psychotherapy() {
  const { pages } = useContent()
  return <h1>{pages.psychotherapy.title}</h1>
}
