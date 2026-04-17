import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/components/Frontoffice/CartItem"
import type { AddressFormData } from "@/types/interfaces/Checkout/AddressFormData"
import type { CheckoutStep } from "@/types/CheckoutStep"
import { AddressForm } from "@/components/forms/AddressForm"
import { SameAddressToggle } from "@/components/Frontoffice/SameAddressToggle"
import { useCheckout } from "@/hooks/useCheckout"
import { useAuth } from "@/hooks/useAuth"
import useCart from "@/hooks/useCart"
import { saveAddresses } from "@/services/orderService"
import { formatCurrency } from "@/utils/currencyFormatter"

function validateAddress(data: AddressFormData, t: (key: string) => string): Partial<Record<keyof AddressFormData, string>> {
  const errors: Partial<Record<keyof AddressFormData, string>> = {}
  if (!data.firstName.trim()) errors.firstName = t("requiredField")
  if (!data.lastName.trim()) errors.lastName = t("requiredField")
  if (!data.addressLine1.trim()) errors.addressLine1 = t("requiredField")
  if (!data.city.trim()) errors.city = t("requiredField")
  if (!data.postcode.trim()) errors.postcode = t("requiredField")
  if (!data.country.trim()) errors.country = t("requiredField")
  return errors
}

export const Cart = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { accessToken, isAuthenticated } = useAuth()
  const {
    billingAddress,
    shippingAddress,
    sameAddress,
    loading: checkoutLoading,
    error: checkoutError,
    checkoutIds,
    setBillingAddress,
    setShippingAddress,
    setSameAddress,
    setLoading,
    setCheckoutIds,
    fetchCheckoutContext,
  } = useCheckout()
  const { cartId, items, updateQuantity, removeFromCart, isLoading: cartLoading, error: cartError, fetchCart } = useCart();

  const hasUnavailableItems = items.some((item) => item.unavailable); // ! ??

  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
  const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false)
  const [isEditingShippingAddress, setIsEditingShippingAddress] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const currentStep: CheckoutStep = searchParams.get("step") === "address" ? "address" : "cart"

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return
    setLoading(true)
    fetchCheckoutContext().finally(() => setLoading(false))
  }, [isAuthenticated, accessToken, fetchCheckoutContext, setLoading])

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const deliveryFee = useMemo(() => {
    // TODO: delivery fee calculation — fixed rate for physical
    // products, 0 for SaaS. To be confirmed with LUCAS for
    // product type data shape.
    const hasPhysicalProduct = items.some((item) => item.isService === false)
    return hasPhysicalProduct ? 5.99 : 0
  }, [items])
  // immediateTotal = ce qui est débité immédiatement (1 période pour les abonnements, pas le total du contrat)
  const immediateTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  )
  const finalTotal = useMemo(() => immediateTotal + deliveryFee, [immediateTotal, deliveryFee])
  const finalTotalWithoutDelivery = useMemo(() => immediateTotal, [immediateTotal])

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity)
  }

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId)
  }

  const handleContinue = () => {
    // TODO: chek user is connecter if not ask user to login or register and redirect flow for unauthenticated users.
    // console.log("User is authenticated:", isAuthenticated)
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart?step=address" } } })
      return
    }
    // console.log(billingAddress, shippingAddress, sameAddress)
    navigate("/cart?step=address")
  }

  const handleValider = async () => {
    setSubmitError(null)

    const nextBillingErrors = validateAddress(billingAddress, t)
    const nextShippingErrors = sameAddress ? {} : validateAddress(shippingAddress, t)
    setBillingErrors(nextBillingErrors)
    setShippingErrors(nextShippingErrors)

    if (Object.keys(nextBillingErrors).length > 0 || Object.keys(nextShippingErrors).length > 0) {
      if (Object.keys(nextBillingErrors).length > 0) setIsEditingBillingAddress(true)
      if (Object.keys(nextShippingErrors).length > 0) setIsEditingShippingAddress(true)
      return
    }
    if (!cartId) {
      setSubmitError(t("missingCartOrAddress"))
      return
    }

    // Si les adresses ne sont pas encore en DB (nouvel utilisateur),
    // on les sauvegarde avant de naviguer vers le paiement.
    let resolvedBillingId = checkoutIds?.billingAddressId
    let resolvedShippingId = checkoutIds?.shippingAddressId

    if (!resolvedBillingId || !resolvedShippingId) {
      try {
        const effectiveShipping = sameAddress ? billingAddress : shippingAddress
        const saved = await saveAddresses(
          { addressLine1: billingAddress.addressLine1, city: billingAddress.city, postcode: billingAddress.postcode, country: billingAddress.country },
          { addressLine1: effectiveShipping.addressLine1, city: effectiveShipping.city, postcode: effectiveShipping.postcode, country: effectiveShipping.country },
          accessToken!
        )
        resolvedBillingId = saved.billing!.id
        resolvedShippingId = saved.shipping!.id
      } catch {
        setSubmitError(t("missingCartOrAddress"))
        return
      }
    }

    // Toujours mettre à jour checkoutIds avec le cartId courant,
    // que les adresses viennent de la DB ou d'une nouvelle saisie.
    setCheckoutIds({ cartId: cartId ?? null, billingAddressId: resolvedBillingId!, shippingAddressId: resolvedShippingId! })
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
      },
    })
  }

  if ((checkoutLoading || cartLoading) && items.length === 0) {
    return <div className="py-20 px-40">{t("loading")}</div>
  }

  if (checkoutError || cartError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{checkoutError || cartError}</p>
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
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">{t("billingAddress")}</p>
                <Button variant="ghost" onClick={() => setIsEditingBillingAddress((prev) => !prev)}>{t("update")}</Button>
              </div>

              {isEditingBillingAddress ? (
                <AddressForm
                  title=""
                  value={billingAddress}
                  onChange={setBillingAddress}
                  errors={billingErrors}
                />
              ) : (
                <>
                  <p>{[billingAddress.firstName, billingAddress.lastName].filter(Boolean).join(" ") || "-"}</p>
                  <p>{billingAddress.addressLine1 || "-"}</p>
                  <p>{billingAddress.city || "-"}</p>
                  <p>{billingAddress.postcode || "-"}</p>
                  <p>{billingAddress.country || "-"}</p>
                </>
              )}
            </div>

            <SameAddressToggle checked={sameAddress} onChange={setSameAddress} />

            {!sameAddress ? (
              <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium">{t("shippingAddress")}</p>
                  <Button variant="ghost" onClick={() => setIsEditingShippingAddress((prev) => !prev)}>{t("update")}</Button>
                </div>

                {isEditingShippingAddress ? (
                  <AddressForm
                    title=""
                    value={shippingAddress}
                    onChange={setShippingAddress}
                    errors={shippingErrors}
                  />
                ) : (
                  <>
                    <p>{[shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(" ") || "-"}</p>
                    <p>{shippingAddress.addressLine1 || "-"}</p>
                    <p>{shippingAddress.city || "-"}</p>
                    <p>{shippingAddress.postcode || "-"}</p>
                    <p>{shippingAddress.country || "-"}</p>
                  </>
                )}
              </div>
            ) : null}
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
