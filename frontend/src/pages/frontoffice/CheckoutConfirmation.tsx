import { Link, Navigate, NavLink, useLocation } from "react-router-dom"
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

  const total = checkoutState.total_amount ?? order?.total_amount ?? 0
  const shippingFee = checkoutState.shippingFee ?? (order as unknown as { shipping_fee?: number })?.shipping_fee ?? 0
  const discountAmount = checkoutState.discountAmount ?? (order as unknown as { discount_amount?: number })?.discount_amount ?? 0
  const promoCode = checkoutState.promoCode ?? (order as unknown as { promo_code?: string | null })?.promo_code ?? null
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
    <div className="mx-auto px-4 sm:px-8 lg:px-40 py-10 space-y-5 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold">{t("orderConfirmed")}</h1>
      {order?.id ? (
        <p className="text-muted-foreground">{t("orderNumber")} {order.id}</p>
      ) : null}

      {items.length > 0 ? (
        <div className="rounded-md border p-4 space-y-3">
          <h2 className="text-lg font-medium">{t("orderedItems")}</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{t(`products.${item.name}.name`)} × {item.quantity}</span>
              <span className="flex flex-col items-end gap-0.5">
                {item.originalUnitPrice !== undefined && (
                  <span className="text-xs text-gray-400 line-through">
                    {t("currency")}{(item.originalUnitPrice * item.quantity).toFixed(2)}
                  </span>
                )}
                <span className={item.originalUnitPrice !== undefined ? 'text-red-600 font-medium' : ''}>
                  {t("currency")}{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
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
        <div className="rounded-md border p-4 space-y-2">
          {items.length > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("subtotal")}</span>
              <span>{t("currency")}{items.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toFixed(2)}</span>
            </div>
          )}
          {shippingFee > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("shipping")}</span>
              <span>{t("currency")}{shippingFee.toFixed(2)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                {t("discount") || "Réduction"}
                {promoCode ? ` (${promoCode})` : ''}
              </span>
              <span>-{t("currency")}{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2" />
          <div className="flex justify-between">
            <span className="font-medium">{t("totalAmount")}</span>
            <span className="font-medium">{t("currency")}{Number(total).toFixed(2)}</span>
          </div>
        </div>
      ) : null}

      <p className="text-muted-foreground">{t("confirmationEmailSent")}</p>

      <div className="flex gap-3">
        <Button>
          <NavLink to="/my-orders" className="text-white">{t("viewMyOrders")}</NavLink>
        </Button>
        <Button asChild variant="outline">
          <Link to="/catalog">{t("backToProducts")}</Link>
        </Button>
      </div>
    </div>
  )
}
