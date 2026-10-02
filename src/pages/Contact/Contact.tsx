import { PageTitle } from '../../components/PageTitle/PageTitle'
import { useContent } from '../../content/useContent'

export function Contact() {
  const { pages } = useContent()
  return <PageTitle text={pages.contact.title} />
}
