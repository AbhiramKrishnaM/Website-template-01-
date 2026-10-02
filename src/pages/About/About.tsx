import { PageTitle } from '../../components/PageTitle/PageTitle'
import { useContent } from '../../content/useContent'

export function About() {
  const { pages } = useContent()
  return <PageTitle text={pages.about.title} />
}
