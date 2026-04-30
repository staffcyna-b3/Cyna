import { useContext } from "react"
import { LanguageContext } from "../contexts/LanguageContext"
import i18n from "../i18n"

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error(i18n.t('useLanguageMustBeUsed'))
  return context
}