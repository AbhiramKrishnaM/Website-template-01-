import { PageTitle } from '../../components/PageTitle/PageTitle'
import { useContent } from '../../content/useContent'

export function PrivacyPolicy() {
  const { pages } = useContent()
  return <PageTitle text={pages.privacyPolicy.title} />
}
