import { Link, Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function MainLayout() {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex justify-evenly">
        <h1>{t("cyna")}</h1>
        <p>{t("searchBar")}</p>
        <p>{t("languageSelector")}</p>
        <Link to="/checkout">{t("cart")}</Link>
        <p>{t("userProfile")}</p>
      </div>
      <Outlet />
    </>
  )
}