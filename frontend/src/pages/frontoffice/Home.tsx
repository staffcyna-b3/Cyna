import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function HomePage() {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div>
            {t("test")}
            <div>
                <Button onClick={handleLogout}>{t("logout")}</Button>
            </div>
        </div>
    )
}