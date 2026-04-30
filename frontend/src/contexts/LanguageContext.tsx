import { createContext } from "react"
import type { LanguageContextValue } from "@/types/interfaces/Language/LanguageContextValue"

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)