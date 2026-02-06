export interface Language {
  code: string
  label: string
  locale?: string
}

export const languages: Language[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
]