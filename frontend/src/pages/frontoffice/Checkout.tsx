import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/components/CartItem"
import { getCheckoutContext } from "@/services/orderService"
import type { AddressFormData } from "@/types/interfaces/Checkout/AddressFormData"
import type { CartItem as CheckoutCartItem } from "@/types/interfaces/Checkout/CartItem"
import type { CheckoutContext } from "@/types/interfaces/Checkout/CheckoutContext"
import type { CheckoutStep } from "@/types/interfaces/Checkout/CheckoutStep"
import { AddressForm } from "@/components/forms/AddressForm"
import { SameAddressToggle } from "@/components/forms/SameAddressToggle"
import { useCheckout } from "@/hooks/useCheckout"
import { useAuth } from "@/hooks/useAuth"

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

export const Checkout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { accessToken, isAuthenticated } = useAuth()
  const {
    billingAddress,
    shippingAddress,
    sameAddress,
    loading,
    error,
    setBillingAddress,
    setShippingAddress,
    setSameAddress,
    setLoading,
    setError,
  } = useCheckout()

  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([])
  const [checkoutIds, setCheckoutIds] = useState<{ cartId: string; billingAddressId: string; shippingAddressId: string } | null>(null)

  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})
  const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false)
  const [isEditingShippingAddress, setIsEditingShippingAddress] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const currentStep: CheckoutStep = searchParams.get("step") === "address" ? "address" : "cart"

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const load = async () => {
      setError(null)
      setLoading(true)
      try {
        const context: CheckoutContext = await getCheckoutContext(accessToken)

        setCartItems(
          context.cart.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            type: undefined,
          }))
        )

        setCheckoutIds(context.checkout)

        const normalizedFullName = (context.user.fullName ?? "").trim()
        const nameParts = normalizedFullName.split(/\s+/)
        const firstName = nameParts[0] ?? ""
        const lastName = nameParts.slice(1).join(" ")

        setBillingAddress({
          firstName,
          lastName,
          addressLine1: context.addresses.billing.addressLine1,
          city: context.addresses.billing.city,
          postcode: context.addresses.billing.postcode,
          country: context.addresses.billing.country,
        })

        setShippingAddress({
          firstName,
          lastName,
          addressLine1: context.addresses.shipping.addressLine1,
          city: context.addresses.shipping.city,
          postcode: context.addresses.shipping.postcode,
          country: context.addresses.shipping.country,
        })

      } catch (caughtError: unknown) {
        const status = (caughtError as { status?: unknown })?.status
        // 404 = pas d'adresses ou panier vide → on laisse l'utilisateur remplir manuellement
        if (status !== 404) {
          if (typeof caughtError === "object" && caughtError !== null && "message" in caughtError) {
            const message = (caughtError as { message?: unknown }).message
            setError(typeof message === "string" ? message : t("unableToLoadCheckout"))
          } else {
            setError(t("unableToLoadCheckout"))
          }
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isAuthenticated, accessToken, setBillingAddress, setError, setLoading, setShippingAddress, t])

  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cartItems])
  const deliveryFee = useMemo(() => {
    // TODO: delivery fee calculation — fixed rate for physical
    // products, 0 for SaaS. To be confirmed with LUCAS for
    // product type data shape.
    const hasPhysicalProduct = cartItems.some((item) => item.type === "PHYSICAL")
    return hasPhysicalProduct ? 5.99 : 0
  }, [cartItems])
  const finalTotal = useMemo(() => cartTotal + deliveryFee, [cartTotal, deliveryFee])

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item))
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleContinue = () => {
    // TODO: DESIR — replace with auth context once gateway JWT PR is merged
    // and reintroduce redirect flow for unauthenticated users.

    navigate("/checkout?step=address")
  }

  const handleValider = async () => {
    setSubmitError(null)

    const nextBillingErrors = validateAddress(billingAddress, t)
    const nextShippingErrors = sameAddress ? {} : validateAddress(shippingAddress, t)
    setBillingErrors(nextBillingErrors)
    setShippingErrors(nextShippingErrors)

    if (Object.keys(nextBillingErrors).length > 0 || Object.keys(nextShippingErrors).length > 0) {
      if (Object.keys(nextBillingErrors).length > 0) {
        setIsEditingBillingAddress(true)
      }
      if (Object.keys(nextShippingErrors).length > 0) {
        setIsEditingShippingAddress(true)
      }
      return
    }

    if (!checkoutIds) {
      setSubmitError(t("missingCartOrAddress"))
      return
    }

    navigate("/checkout/payment", {
      state: {
        cartItems: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPriceCents: Math.round(item.unitPrice * 100),
          isRecurring: item.type !== undefined && item.type !== "PHYSICAL",
        })),
        cartId: checkoutIds.cartId,
        billingAddressId: checkoutIds.billingAddressId,
        shippingAddressId: checkoutIds.shippingAddressId,
      },
    })
  }

  if (loading) {
    return <div className="py-20 px-40">{t("loadingCheckoutData")}</div>
  }

  if (error) {
    return <div className="py-20 px-40 text-destructive">{error}</div>
  }

  if (currentStep === "cart" && cartItems.length === 0) {
    return (
      <div className="py-20 px-40">
        <div className="rounded-lg border p-6 flex flex-col gap-4 w-fit">
          <p>{t("emptyCart")}</p>
          <Button asChild>
            <Link to="/products">{t("viewProducts")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 px-40">
      <div className="flex justify-between mb-10">
        <p className="text-5xl">{currentStep === "cart" ? t("cart") : t("shippingAddress")}</p>
        <div>
          <p className="text-lg">{t("totalOf")} {totalItems} {t("items")}</p>
          <Link to="/products" className="text-primary">{t("continueShopping")}</Link>
        </div>
      </div>

      <div className="flex justify-between gap-8">
        {currentStep === "cart" ? (
          <div className="flex flex-col gap-2 flex-1">
            {cartItems.map((item) => (
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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{t("currency")}{(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="w-full border-t border-white/20" />
              <div className="w-full text-white text-sm flex justify-between">
                <span>{t("subtotal")}</span>
                <span>{t("currency")}{cartTotal.toFixed(2)}</span>
              </div>
              <div className="w-full text-white text-sm flex justify-between">
                <span>{t("shipping")}</span>
                <span>{t("currency")}{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="w-full text-white flex justify-between font-semibold">
                <span>{t("total")}</span>
                <span>{t("currency")}{finalTotal.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-white">{t("total")}</p>
              <p className="text-white">{t("currency")}{cartTotal.toFixed(2)}</p>
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
