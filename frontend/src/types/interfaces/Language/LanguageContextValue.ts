import type { Language } from "@/types/interfaces/language/Language"

export interface LanguageContextValue {
  currentLanguage: Language
  setLanguage: (code: string) => void
  availableLanguages: Language[]
}