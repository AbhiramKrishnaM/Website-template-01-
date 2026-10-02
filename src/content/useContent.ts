import { useParams } from 'react-router'
import { DEFAULT_LANG, isLang, type Lang } from '../lib/i18n'
import { en } from './en'
import type { Content } from './types'
import { uk } from './uk'

const CONTENT: Record<Lang, Content> = { en, uk }

export function useLang(): Lang {
  const { lang } = useParams()
  return isLang(lang) ? lang : DEFAULT_LANG
}

export function useContent(): Content {
  return CONTENT[useLang()]
}
