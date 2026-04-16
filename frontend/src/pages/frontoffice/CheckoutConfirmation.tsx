import { Link, Navigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import type { CheckoutConfirmationState } from "@/types/interfaces/CheckoutConfirmation/CheckoutConfirmationState"
import type { ConfirmationItem } from "@/types/interfaces/CheckoutConfirmation/ConfirmationItem"
import { useCheckout } from "@/hooks/useCheckout"

export const CheckoutConfirmation = () => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const { confirmedOrder } = useCheckout()
  const checkoutState = (state ?? {}) as CheckoutConfirmationState
  const order = checkoutState.order ?? (confirmedOrder as CheckoutConfirmationState["order"] | null)
  const paymentIntentId = checkoutState.paymentIntentId

  if (!order && !paymentIntentId) {
    return <Navigate to="/cart" replace />
  }

  const total = order?.total_amount ?? checkoutState.total_amount ?? 0
  const fallbackItems: ConfirmationItem[] =
    order?.items?.map((item) => ({
      id: item.id,
      name: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })) ?? []
  const items = checkoutState.items ?? fallbackItems

  const billingAddress = checkoutState.billingAddress
  const shippingAddress = checkoutState.shippingAddress

  return (
    <div className="mx-auto px-40 py-10 space-y-5 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold">{t("orderConfirmed")}</h1>
      {order?.id ? (
        <p className="text-muted-foreground">{t("orderNumber")} {order.id}</p>
      ) : null}

      {items.length > 0 ? (
        <div className="rounded-md border p-4 space-y-3">
          <h2 className="text-lg font-medium">{t("orderedItems")}</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span>
                {item.quantity} {t("multiply")} {t("currency")}{item.unitPrice.toFixed(2)} {t("equals")} {t("currency")}{(item.quantity * item.unitPrice).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {billingAddress ? (
        <div className="rounded-md border p-4 space-y-1">
          <h2 className="text-lg font-medium">{t("billingAddress")}</h2>
          <p>{billingAddress.firstName} {billingAddress.lastName}</p>
          <p>{billingAddress.addressLine1}</p>
          <p>{billingAddress.postcode} {billingAddress.city}</p>
          <p>{billingAddress.country}</p>
        </div>
      ) : null}

      {shippingAddress ? (
        <div className="rounded-md border p-4 space-y-1">
          <h2 className="text-lg font-medium">{t("shippingAddress")}</h2>
          <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
          <p>{shippingAddress.addressLine1}</p>
          <p>{shippingAddress.postcode} {shippingAddress.city}</p>
          <p>{shippingAddress.country}</p>
        </div>
      ) : null}

      {total > 0 ? (
        <div className="rounded-md border p-4 flex justify-between">
          <span className="font-medium">{t("totalAmount")}</span>
          <span className="font-medium">{t("currency")}{Number(total).toFixed(2)}</span>
        </div>
      ) : null}

      <p className="text-muted-foreground">{t("confirmationEmailSent")}</p>

      <div className="flex gap-3">
        <Button asChild disabled>
          {/* <Link to="/account/orders">{t("viewMyOrders")}</Link> */}
          <span>{t("viewMyOrders")}</span>
        </Button>
        <Button asChild variant="outline">
          <Link to="/catalog">{t("backToProducts")}</Link>
        </Button>
      </div>
    </div>
  )
}
