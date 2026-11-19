'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { DEFAULT_LANG, localizePath, type Lang } from '@/lib/i18n'
import { getDictionary, type Dict } from '@/lib/dictionaries'

const LangContext = createContext<Lang>(DEFAULT_LANG)

/** Idioma de la página para los componentes de cliente (Header, Footer, modal…). Lo pone app/[lang]/layout.tsx. */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export function useLang(): Lang {
  return useContext(LangContext)
}

/** Textos del idioma actual. */
export function useDict(): Dict {
  return getDictionary(useLang())
}

/** Convierte un enlace interno en español al idioma actual ("/paquetes" → "/en/packages"). */
export function useLocalizePath(): (path: string) => string {
  const lang = useLang()
  return (path: string) => localizePath(lang, path)
}
