import { useTranslation } from "react-i18next"
import { useCallback } from "react"

export const useTranslateWithHtml = () => {
  const { t } = useTranslation()

  const translateWithHtml = useCallback(
    (key: string) => {
      return { __html: t(key) }
    },
    [t]
  )

  return { translateWithHtml }
}