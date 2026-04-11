import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useState } from "react";
import { useTranslation } from "react-i18next"

export default function Dashboard() {
    const { t } =  useTranslation();
    const [selected, setSelected] = useState("active");

    const topRightActions = (
        <div className="flex items-center gap-2 bg-primary rounded-full p-1">
            <Button variant={selected === "active" ? 'selected' : 'notSelected'} onClick={() => setSelected("active")}>{t("active")}</Button>
            <Button variant={selected === "inactive" ? 'selected' : 'notSelected'} onClick={() => setSelected("inactive")}>{t("inactive")}</Button>
        </div>
    )

    return (
        <>
            <header className="px-4 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Typography>{t("dashboard")}</Typography>
                {topRightActions}
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <p>Contenu de la page Dashboard</p>
            </div>
        </>
    )
}