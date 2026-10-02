import { useContent } from '../../content/useContent'

export function Contact() {
  const { pages } = useContent()
  return <h1>{pages.contact.title}</h1>
}
