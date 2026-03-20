import { Link, Navigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

type OrderState = {
  order?: {
    id?: string
    total_amount?: number
    totalAmount?: number
  }
  items?: Array<{
    id: string | number
    name: string
    quantity: number
    unitPrice: number
  }>
  totalAmount?: number
}

export const CheckoutConfirmation = () => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const checkoutState = (state ?? {}) as OrderState

  if (!checkoutState?.order) {
    return <Navigate to="/cart" replace />
  }

  const total = checkoutState.order.totalAmount ?? checkoutState.order.total_amount ?? checkoutState.totalAmount ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-5">
      <h1 className="text-3xl font-semibold">{t("orderConfirmed")}</h1>
      <p className="text-muted-foreground">{t("orderNumber")} {checkoutState.order.id}</p>

      <div className="rounded-md border p-4 space-y-3">
        <h2 className="text-lg font-medium">{t("orderedItems")}</h2>
        {checkoutState.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span>
              {item.quantity} {t("multiply")} {t("currency")}{item.unitPrice.toFixed(2)} {t("equals")} {t("currency")}{(item.quantity * item.unitPrice).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-md border p-4 flex justify-between">
        <span className="font-medium">{t("totalAmount")}</span>
        <span className="font-medium">{t("currency")}{Number(total).toFixed(2)}</span>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link to="/account/orders">View my orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/products">Back to catalogue</Link>
        </Button>
      </div>
    </div>
  )
}
