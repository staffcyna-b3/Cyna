import * as React from "react"
import {
  ArrowLeftRight,
  Boxes,
  LayoutDashboard,
  LogOut,
  Percent,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/Backoffice/layout/nav-main"
import { NavUser } from "@/components/Backoffice/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Typography } from "../../ui/typography"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

const navItems = [
  { title: 'dashboard', url: "/dashboard", icon: LayoutDashboard },
  { title: 'products', url: "/products", icon: Boxes },
  { title: 'users', url: "/users", icon: Users },
  { title: 'orders', url: "/orders", icon: ShoppingCart },
  { title: 'transactions', url: "/transactions", icon: ArrowLeftRight },
  { title: 'discounts', url: "/discounts", icon: Percent },
]

function SidebarFooterContent() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 pb-2">
        <button
          onClick={() => navigate("/settings")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 bg-primary rounded-full p-1.5 mx-2 mb-2">
      <button
        onClick={() => navigate("/settings")}
        className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground hover:bg-white/10 transition-colors"
      >
        <Settings size={18} />
      </button>
      <button
        onClick={handleLogout}
        className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground hover:bg-white/10 transition-colors"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton className="group-data-[state=expanded]:flex-row-reverse group-data-[state=expanded]:justify-between">
          <SidebarTrigger className="-ml-1" />
          <Typography variant="h1" className="text-3xl text-primary">{t("CYNA")}</Typography>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
