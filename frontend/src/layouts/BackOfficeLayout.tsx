import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppSidebar } from "@/components/Backoffice/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { fetchBackOfficeProducts, useBackOfficeProductsStore } from "@/stores/backoffice/backOfficeProductsStore"
import { LOW_STOCK_THRESHOLD } from "@/lib/stockConstants"

const SESSION_KEY = 'low_stock_alert_shown'

export default function BackOfficeLayout() {
  const { t } = useTranslation()
  const { items } = useBackOfficeProductsStore()
  const fetched = useRef(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    void fetchBackOfficeProducts({})
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    const lowStock = items.filter(p => !p.is_service && p.stock <= LOW_STOCK_THRESHOLD)
    if (lowStock.length > 0) {
      setOpen(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }
  }, [items])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 min-w-0 overflow-x-hidden">
        <Outlet />
      </SidebarInset>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('backoffice.lowStockAlertTitle')}</DialogTitle>
            <DialogDescription>
              {t('backoffice.lowStockAlertDescription', { threshold: LOW_STOCK_THRESHOLD })}
            </DialogDescription>
          </DialogHeader>
          <ul className="mt-2 space-y-1 text-sm">
            {items
              .filter(p => !p.is_service && p.stock <= LOW_STOCK_THRESHOLD)
              .map(p => (
                <li key={p.id} className="flex justify-between">
                  <span>{t(`products.${p.name}.name`)}</span>
                  <span className="font-semibold text-red-600">{p.stock} {t('backoffice.lowStockUnit')}</span>
                </li>
              ))}
          </ul>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
