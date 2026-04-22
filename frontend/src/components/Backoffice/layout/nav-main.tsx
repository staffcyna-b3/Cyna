import { type LucideIcon } from "lucide-react"

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTranslation } from "react-i18next"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
    }[]
}) {
    const { t } = useTranslation();
    const location = useLocation();

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = item.url === location.pathname;
                    return (
                        <NavLink to={item.url} key={item.url}>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip={t(item.title)}
                                    isActive={isActive}
                                    className={cn(
                                        isActive && "bg-primary! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground!"
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon fill={isActive ? "currentColor" : "transparent"} />
                                    )}
                                    <span>{t(item.title)}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </NavLink>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}