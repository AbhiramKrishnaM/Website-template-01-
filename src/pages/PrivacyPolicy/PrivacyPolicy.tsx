import { useContent } from '../../content/useContent'

export function PrivacyPolicy() {
  const { pages } = useContent()
  return <h1>{pages.privacyPolicy.title}</h1>
}
