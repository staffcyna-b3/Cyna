import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CartItem } from "@/components/Frontoffice/CartItem"
import type { CheckoutStep } from "@/types/CheckoutStep"
import { useCheckout } from "@/hooks/useCheckout"
import { useAuth } from "@/hooks/useAuth"
import useCart from "@/hooks/useCart"
import { formatCurrency } from "@/utils/currencyFormatter"
import { getAddresses, type Address } from "@/services/addressService"
import { useSearchParams } from "react-router-dom"

export const Cart = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { accessToken, isAuthenticated } = useAuth()
  const {
    loading: checkoutLoading,
    setCheckoutIds,
  } = useCheckout()
  const { cartId, items, updateQuantity, removeFromCart, isLoading: cartLoading, error: cartError, fetchCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([])
  const [billingId, setBillingId] = useState('')
  const [shippingId, setShippingId] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const currentStep: CheckoutStep = searchParams.get("step") === "address" ? "address" : "cart"

  useEffect(() => {
    if (!accessToken) return
    getAddresses(accessToken).then((list) => {
      setAddresses(list)
      const defB = list.find((a) => a.type === 'billing' && a.is_default)
      const defS = list.find((a) => a.type === 'shipping' && a.is_default)
      setBillingId(defB?.id ?? list.find((a) => a.type === 'billing')?.id ?? '')
      setShippingId(defS?.id ?? list.find((a) => a.type === 'shipping')?.id ?? '')
    }).catch(() => {})
  }, [accessToken])

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const deliveryFee = useMemo(() => {
    const hasPhysicalProduct = items.some((item) => item.isService === false)
    return hasPhysicalProduct ? 5.99 : 0
  }, [items])
  const immediateTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  )
  const finalTotal = useMemo(() => immediateTotal + deliveryFee, [immediateTotal, deliveryFee])
  const finalTotalWithoutDelivery = useMemo(() => immediateTotal, [immediateTotal])

  const handleContinue = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart?step=address" } } })
      return
    }
    navigate("/cart?step=address")
  }

  const handleValider = () => {
    setSubmitError(null)
    if (!billingId || !shippingId) {
      toast.error(t('selectAddressRequired'))
      return
    }
    if (!cartId) {
      setSubmitError(t("missingCartOrAddress"))
      return
    }
    setCheckoutIds({ cartId: cartId ?? null, billingAddressId: billingId, shippingAddressId: shippingId })
    navigate("/checkout/payment", {
      state: {
        cartItems: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPriceCents: Math.round(item.unitPrice * 100),
          isService: item.isService === true && item.period != null,
          isRecurring: item.isService === true && item.period != null,
          billingPeriod: item.period != null ? 'monthly' : undefined,
          durationMonths: item.period ?? undefined,
        })),
        cartId,
        billingAddressId: resolvedBillingId,
        shippingAddressId: resolvedShippingId,
        billingAddress,
        deliveryFeeCents: Math.round(deliveryFee * 100),
      },
    })
  }

  if ((checkoutLoading || cartLoading) && items.length === 0) {
    return <div className="py-20 px-40">{t("loading")}</div>
  }

  if (cartError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{cartError}</p>
        <Button onClick={() => void fetchCart()}>{t('retry') || 'Réessayer'}</Button>
      </div>
    )
  }

  if (currentStep === "cart" && items.length === 0) {
    return (
      <div className="py-20 px-40 flex justify-center items-center">
        <div className="rounded-lg p-6 flex flex-col gap-4 w-fit">
          <p>{t("emptyCart")}</p>
          <Button variant={'cyna'} asChild>
            <Link to="/catalog">{t("viewProducts")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const billingAddresses = addresses.filter((a) => a.type === 'billing')
  const shippingAddresses = addresses.filter((a) => a.type === 'shipping')

  return (
    <div className="py-20 px-40 min-h-screen bg-white">
      <div className="flex justify-between mb-10">
        <p className="text-5xl">{currentStep === "cart" ? t("cart.title") : t("shippingAddress")}</p>
        <div>
          <p className="text-lg">{t("totalOf")} {totalItems} {t("items")}</p>
          <Link to="/catalog" className="text-primary">{t("continueShopping")}</Link>
        </div>
      </div>

      <div className="flex justify-between gap-8">
        {currentStep === "cart" ? (
          <div className="flex flex-col gap-2 flex-1">
            {items.map((item) => (
              <CartItem
                item={item}
                key={item.id}
                onQuantityChange={(id, qty) => updateQuantity(id, qty)}
                onRemove={(id) => removeFromCart(id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-2">
              <Label>{t('billingAddress')}</Label>
              {billingAddresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('account.noAddressesOfType')}{' '}
                  <Link to="/account" className="underline text-primary">{t('manageAddresses')}</Link>
                </p>
              ) : (
                <Select value={billingId} onValueChange={setBillingId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAddress')} />
                  </SelectTrigger>
                  <SelectContent>
                    {billingAddresses.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.address_line1}
                        {a.address_line2 ? `, ${a.address_line2}` : ''}
                        {' — '}{a.city} {a.postcode}
                        {a.is_default ? ' ★' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('shippingAddress')}</Label>
              {shippingAddresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('account.noAddressesOfType')}{' '}
                  <Link to="/account" className="underline text-primary">{t('manageAddresses')}</Link>
                </p>
              ) : (
                <Select value={shippingId} onValueChange={setShippingId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAddress')} />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingAddresses.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.address_line1}
                        {a.address_line2 ? `, ${a.address_line2}` : ''}
                        {' — '}{a.city} {a.postcode}
                        {a.is_default ? ' ★' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              <Link to="/account" className="underline text-primary">{t('manageAddresses')}</Link>
            </p>
          </div>
        )}

        <div className="bg-black rounded-lg py-4 px-6 h-fit gap-4 flex flex-col items-end">
          {currentStep === "address" ? (
            <>
              <p className="text-white self-start font-medium">{t("summary")}</p>
              <div className="w-full text-white text-sm flex flex-col gap-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="w-full border-t border-white/20" />
              <div className="w-full text-white text-sm flex justify-between">
                <span>{t("subtotal")}</span>
                <span>{formatCurrency(immediateTotal)}</span>
              </div>
              <div className="w-full text-white text-sm flex justify-between">
                <span>{t("shipping")}</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="w-full text-white flex justify-between font-semibold">
                <span>{t("total")}</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-white">{t("total")}</p>
              <p className="text-white">{formatCurrency(finalTotalWithoutDelivery)}</p>
            </>
          )}
          {currentStep === "cart" ? (
            <Button onClick={handleContinue}>{t("proceed")}</Button>
          ) : (
            <Button onClick={handleValider}>{t("validate")}</Button>
          )}
          {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
        </div>
      </div>
    </div>
  )
}
