import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router'
import { useSmoothScroll } from '../animation/useSmoothScroll'
import { DEFAULT_LANG, isLang } from '../lib/i18n'

export function LangLayout() {
  const { lang } = useParams()
  useSmoothScroll()

  useEffect(() => {
    if (isLang(lang)) document.documentElement.lang = lang
  }, [lang])

  if (!isLang(lang)) return <Navigate to={`/${DEFAULT_LANG}`} replace />

  return (
    <main>
      <Outlet />
    </main>
  )
}
