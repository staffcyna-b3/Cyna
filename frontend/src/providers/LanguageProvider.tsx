import { useState, useCallback, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { languages } from "../i18n/language"
import type { Language } from "@/types/interfaces/language/Language"
import { LanguageContext } from "../contexts/LanguageContext"


export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation()
  const defaultLang = languages.find((l) => l.code === "fr")!
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLang)

  const setLanguage = useCallback(
    (code: string) => {
      const lang = languages.find((l) => l.code === code)
      if (!lang) return
      i18n.changeLanguage(lang.code)
      setCurrentLanguage(lang)
    },
    [i18n]
  )

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, setLanguage, availableLanguages: languages }}
    >
      {children}
    </LanguageContext.Provider>
  )
}