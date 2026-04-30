import { AppSidebar } from "@/components/Backoffice/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"

export default function BackOfficeLayout() {
// check here for auth and role to display backoffice layout only for admin users
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 min-w-0 overflow-x-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}