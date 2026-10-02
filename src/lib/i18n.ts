export const LANGS = ['en', 'uk'] as const
export const DEFAULT_LANG = 'en'

export type Lang = (typeof LANGS)[number]

export function isLang(value: string | undefined): value is Lang {
  return LANGS.includes(value as Lang)
}
