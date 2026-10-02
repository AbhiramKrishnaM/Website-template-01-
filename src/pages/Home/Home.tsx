import { PageTitle } from '../../components/PageTitle/PageTitle'
import { useContent } from '../../content/useContent'

export function Home() {
  const { pages } = useContent()
  return <PageTitle text={pages.home.title} />
}
