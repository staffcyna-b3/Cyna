import type { Language } from "@/types/interfaces/Language/Language"

export interface LanguageContextValue {
  currentLanguage: Language
  setLanguage: (code: string) => void
  availableLanguages: Language[]
}