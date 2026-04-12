import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function HomePage() {
    const { t } = useTranslation();

    return (
        <div>
            {t("test")}
        </div>
    )
}