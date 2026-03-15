"use client"

import * as React from "react"
import {
  ArrowLeftRight,
  BanknoteArrowDown,
  Boxes,
  HandCoins,
  LayoutDashboard,
  Percent,
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
} from "@/components/ui/sidebar"
import { TypographyH1 } from "../../ui/typography"
import { Button } from "@/components/ui/button"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: 'dashboard',
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: 'products',
      url: "/products",
      icon: Boxes,
    },
    {
      title: 'users',
      url: "/users",
      icon: Users,
    },
    {
      title: 'orders',
      url: "/orders",
      icon: ShoppingCart,
    },
    {
      title: 'transactions',
      url: "/transactions",
      icon: ArrowLeftRight,
    },
    {
      title: 'refunds',
      url: "/refunds",
      icon: HandCoins,
    },
    {
      title: 'discounts',
      url: "/discounts",
      icon: Percent,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader >
        <SidebarMenuButton className="group-data-[state=expanded]:flex-row-reverse group-data-[state=expanded]:justify-between ">
          <SidebarTrigger className="-ml-1" />
          <TypographyH1>Cyna</TypographyH1>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
