import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router'
import { ScrollTrigger } from '../animation/gsap'
import { getLenis, useSmoothScroll } from '../animation/useSmoothScroll'
import { Footer } from '../components/Footer/Footer'
import { Header } from '../components/Header/Header'
import { InkTransition } from '../components/InkTransition/InkTransition'
import { Preloader } from '../components/Preloader/Preloader'
import { DEFAULT_LANG, isLang } from '../lib/i18n'
import styles from './LangLayout.module.css'

export function LangLayout() {
  const { lang } = useParams()
  const { pathname } = useLocation()
  useSmoothScroll()

  useEffect(() => {
    if (isLang(lang)) document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [pathname])

  if (!isLang(lang)) return <Navigate to={`/${DEFAULT_LANG}`} replace />

  return (
    <>
      <Preloader />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <InkTransition />
    </>
  )
}
