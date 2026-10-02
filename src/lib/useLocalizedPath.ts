import { useLocation } from 'react-router'
import { useLang } from '../content/useContent'
import type { Lang } from './i18n'

export function useLocalizedPath(): (path: string) => string {
  const lang = useLang()
  return (path) => `/${lang}${path === '/' ? '' : path}`
}

export function useSwitchLangPath(): (lang: Lang) => string {
  const { pathname, hash } = useLocation()
  return (lang) => pathname.replace(/^\/[^/]+/, `/${lang}`) + hash
}
