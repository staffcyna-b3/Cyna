import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTranslation } from "react-i18next"
import { NavLink, useLocation } from "react-router-dom"

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
        {items.map((item) => (
          <NavLink to={item.url}>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title} isActive={item.url === location.pathname}>
                    {item.icon && <item.icon fill={item.url === location.pathname ? "currentColor" : 'transparent'}/>}
                    <span>{t(item.title)}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
