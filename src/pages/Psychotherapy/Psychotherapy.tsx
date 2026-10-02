import { PageTitle } from '../../components/PageTitle/PageTitle'
import { useContent } from '../../content/useContent'

export function Psychotherapy() {
  const { pages } = useContent()
  return <PageTitle text={pages.psychotherapy.title} />
}
