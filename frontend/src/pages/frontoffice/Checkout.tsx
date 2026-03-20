import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFrontSession, isFrontAuthenticated, setFrontUserProfile } from "@/lib/frontAuth"
import { createOrder, getCheckoutContext } from "@/services/orderService"
import type { CheckoutContext } from "@/services/orderService"

const LIVRAISON_COST = 4.99

type CheckoutItem = {
  id: string
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

export const Checkout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([])
  const [checkoutIds, setCheckoutIds] = useState<{ cartId: string; billingAddressId: string; shippingAddressId: string } | null>(null)

  const [billingFirstName, setBillingFirstName] = useState("")
  const [billingLastName, setBillingLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")
  const [billingAddress, setBillingAddress] = useState("")
  const [billingCity, setBillingCity] = useState("")
  const [billingPostalCode, setBillingPostalCode] = useState("")
  const [billingCountry, setBillingCountry] = useState("")
  const [shippingFirstName, setShippingFirstName] = useState("")
  const [shippingLastName, setShippingLastName] = useState("")

  const [useFacturationAddress, setUseFacturationAddress] = useState(false)
  const [isEditingShippingAddress, setIsEditingShippingAddress] = useState(false)
  const [isEditingBillingAddress, setIsEditingBillingAddress] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const currentStep = searchParams.get("step") === "address" ? "address" : "cart"

  useEffect(() => {
    const load = async () => {
      setLoadingError(null)
      const session = getFrontSession()

      if (!session) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const context: CheckoutContext = await getCheckoutContext()

        setCartItems(
          context.cart.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        )

        setCheckoutIds(context.checkout)

        const normalizedFullName = (context.user.fullName ?? "").trim()
        const nameParts = normalizedFullName.split(/\s+/)
        const firstName = nameParts[0] ?? ""
        const lastName = nameParts.slice(1).join(" ")

        setBillingFirstName(firstName)
        setBillingLastName(lastName)
        setShippingFirstName(firstName)
        setShippingLastName(lastName)

        setBillingAddress(context.addresses.billing.addressLine1)
        setBillingCity(context.addresses.billing.city)
        setBillingPostalCode(context.addresses.billing.postcode)
        setBillingCountry(context.addresses.billing.country)

        setAddress(context.addresses.shipping.addressLine1)
        setCity(context.addresses.shipping.city)
        setPostalCode(context.addresses.shipping.postcode)
        setCountry(context.addresses.shipping.country)

        setFrontUserProfile({
          fullName: context.user.fullName,
          address: context.addresses.shipping.addressLine1,
          city: context.addresses.shipping.city,
          postalCode: context.addresses.shipping.postcode,
        })
      } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "message" in error) {
          const message = (error as { message?: unknown }).message
          setLoadingError(typeof message === "string" ? message : "Unable to load checkout context")
        } else {
          setLoadingError("Unable to load checkout context")
        }
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cartItems])
  const finalTotal = useMemo(() => cartTotal + LIVRAISON_COST, [cartTotal])

  const shippingAddress = useFacturationAddress ? billingAddress : address
  const shippingCity = useFacturationAddress ? billingCity : city
  const shippingPostalCode = useFacturationAddress ? billingPostalCode : postalCode
  const shippingCountry = useFacturationAddress ? billingCountry : country
  const effectiveShippingFirstName = useFacturationAddress ? billingFirstName : shippingFirstName
  const effectiveShippingLastName = useFacturationAddress ? billingLastName : shippingLastName

  const validateAddressStep = () => {
    const errors: Record<string, string> = {}

    if (!billingFirstName.trim()) errors.billingFirstName = "First name is required"
    if (!billingLastName.trim()) errors.billingLastName = "Last name is required"
    if (!billingAddress.trim()) errors.billingAddress = "Address line 1 is required"
    if (!billingCity.trim()) errors.billingCity = "City is required"
    if (!billingPostalCode.trim()) errors.billingPostalCode = "Postcode is required"
    if (!billingCountry.trim()) errors.billingCountry = "Country is required"

    if (!useFacturationAddress) {
      if (!shippingFirstName.trim()) errors.shippingFirstName = "First name is required"
      if (!shippingLastName.trim()) errors.shippingLastName = "Last name is required"
      if (!address.trim()) errors.shippingAddress = "Address line 1 is required"
      if (!city.trim()) errors.shippingCity = "City is required"
      if (!postalCode.trim()) errors.shippingPostalCode = "Postcode is required"
      if (!country.trim()) errors.shippingCountry = "Country is required"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const goToAddressStep = () => {
    if (!isFrontAuthenticated() || !getFrontSession()) {
      const redirectTo = encodeURIComponent("/checkout?step=address")
      navigate(`/login?redirect=${redirectTo}`)
      return
    }

    setSearchParams({ step: "address" })
  }

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message?: unknown }).message
      if (typeof message === "string") {
        return message
      }
    }

    return "Unable to validate order"
  }

  const goToConfirmationStep = async () => {
    setSubmitError(null)

    if (!validateAddressStep()) {
      return
    }

    const session = getFrontSession()
    if (!session) {
      const redirectTo = encodeURIComponent("/checkout?step=address")
      navigate(`/login?redirect=${redirectTo}`)
      return
    }

    if (!checkoutIds) {
      setSubmitError("Missing cart or address identifiers")
      return
    }

    setIsSubmittingOrder(true)

    try {
      const order = await createOrder(checkoutIds)

      navigate("/checkout/confirmation", {
        state: {
          order,
          items:
            order?.items?.map((item: { id: string; product_name: string; quantity: number; unit_price: number }) => ({
              id: item.id,
              name: item.product_name,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
            })) ??
            cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          totalAmount: Number(finalTotal.toFixed(2)),
        },
      })
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  if (isLoading) {
    return <div className="py-20 px-40">{t("loadingCheckoutData")}</div>
  }

  if (loadingError) {
    return <div className="py-20 px-40 text-destructive">{loadingError}</div>
  }

  return (
    <div className="py-20 px-40">
      <div className="flex justify-between mb-10">
        <p className="text-5xl">{currentStep === "cart" ? "Panier" : "Adresse de livraison"}</p>
        <div>
          <p className="text-lg">{t("totalOf")} {totalItems} {t("items")}</p>
          <Link to="/" className="text-primary">Continuer vos achats</Link>
        </div>
      </div>

      <div className="flex justify-between gap-8">
        {currentStep === "cart" ? (
          <div className="flex flex-col gap-2 flex-1">
            {cartItems.map((item) => (
              <div className="flex bg-muted/30 p-4 rounded-lg gap-4" key={item.id}>
                <div className="flex flex-col gap-2">
                  <p>{item.name}</p>
                  <p>{t("currency")}{item.unitPrice.toFixed(2)}</p>
                  <p>{t("quantity")} {item.quantity}</p>
                  <p>{t("total")} {t("currency")}{(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">{t("billingAddress")}</p>
                <Button variant="ghost" onClick={() => setIsEditingBillingAddress(true)}>{t("update")}</Button>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={useFacturationAddress} onChange={(event) => setUseFacturationAddress(event.target.checked)} />
                <span>{t("useBillingForShipping")}</span>
              </label>
              {isEditingBillingAddress ? (
                <>
                  <Input value={billingFirstName} onChange={(event) => setBillingFirstName(event.target.value)} placeholder="Prénom" />
                  {fieldErrors.billingFirstName ? <p className="text-destructive text-sm">{fieldErrors.billingFirstName}</p> : null}
                  <Input value={billingLastName} onChange={(event) => setBillingLastName(event.target.value)} placeholder="Nom" />
                  {fieldErrors.billingLastName ? <p className="text-destructive text-sm">{fieldErrors.billingLastName}</p> : null}
                  <Input value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} placeholder="Adresse" />
                  {fieldErrors.billingAddress ? <p className="text-destructive text-sm">{fieldErrors.billingAddress}</p> : null}
                  <Input value={billingCity} onChange={(event) => setBillingCity(event.target.value)} placeholder="Ville" />
                  {fieldErrors.billingCity ? <p className="text-destructive text-sm">{fieldErrors.billingCity}</p> : null}
                  <Input value={billingPostalCode} onChange={(event) => setBillingPostalCode(event.target.value)} placeholder="Code postal" />
                  {fieldErrors.billingPostalCode ? <p className="text-destructive text-sm">{fieldErrors.billingPostalCode}</p> : null}
                  <Input value={billingCountry} onChange={(event) => setBillingCountry(event.target.value)} placeholder="Pays" />
                  {fieldErrors.billingCountry ? <p className="text-destructive text-sm">{fieldErrors.billingCountry}</p> : null}
                </>
              ) : (
                <>
                  <p>{[billingFirstName, billingLastName].filter(Boolean).join(" ") || "-"}</p>
                  <p>{billingAddress || "-"}</p>
                  <p>{billingCity || "-"}</p>
                  <p>{billingPostalCode || "-"}</p>
                  <p>{billingCountry || "-"}</p>
                </>
              )}
            </div>

            <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">{t("shippingAddress")}</p>
                {!useFacturationAddress && <Button variant="ghost" onClick={() => setIsEditingShippingAddress(true)}>{t("update")}</Button>}
              </div>
              {useFacturationAddress ? (
                <p>{t("sameAsBilling")}</p>
              ) : isEditingShippingAddress ? (
                <>
                  <Input value={shippingFirstName} onChange={(event) => setShippingFirstName(event.target.value)} placeholder="Prénom" />
                  {fieldErrors.shippingFirstName ? <p className="text-destructive text-sm">{fieldErrors.shippingFirstName}</p> : null}
                  <Input value={shippingLastName} onChange={(event) => setShippingLastName(event.target.value)} placeholder="Nom" />
                  {fieldErrors.shippingLastName ? <p className="text-destructive text-sm">{fieldErrors.shippingLastName}</p> : null}
                  <Input value={shippingAddress} onChange={(event) => setAddress(event.target.value)} placeholder="Adresse" />
                  {fieldErrors.shippingAddress ? <p className="text-destructive text-sm">{fieldErrors.shippingAddress}</p> : null}
                  <Input value={shippingCity} onChange={(event) => setCity(event.target.value)} placeholder="Ville" />
                  {fieldErrors.shippingCity ? <p className="text-destructive text-sm">{fieldErrors.shippingCity}</p> : null}
                  <Input value={shippingPostalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="Code postal" />
                  {fieldErrors.shippingPostalCode ? <p className="text-destructive text-sm">{fieldErrors.shippingPostalCode}</p> : null}
                  <Input value={shippingCountry} onChange={(event) => setCountry(event.target.value)} placeholder="Pays" />
                  {fieldErrors.shippingCountry ? <p className="text-destructive text-sm">{fieldErrors.shippingCountry}</p> : null}
                </>
              ) : (
                <>
                  <p>{[effectiveShippingFirstName, effectiveShippingLastName].filter(Boolean).join(" ") || "-"}</p>
                  <p>{shippingAddress || "-"}</p>
                  <p>{shippingCity || "-"}</p>
                  <p>{shippingPostalCode || "-"}</p>
                  <p>{shippingCountry || "-"}</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-black rounded-lg py-4 px-6 h-fit gap-4 flex flex-col items-end">
          <p className="text-white">{t("total")}</p>
          {currentStep === "address" ? (
            <>
              <p className="text-white">{t("shipping")} {t("currency")}{LIVRAISON_COST.toFixed(2)}</p>
              <p className="text-white">{t("currency")}{finalTotal.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-white">{t("currency")}{cartTotal.toFixed(2)}</p>
          )}
          {currentStep === "cart" ? (
            <button className="px-4 py-2 rounded-lg bg-primary text-white" onClick={goToAddressStep}>{t("proceed")}</button>
          ) : (
            <button className="px-4 py-2 rounded-lg bg-primary text-white" onClick={goToConfirmationStep} disabled={isSubmittingOrder}>
              {isSubmittingOrder ? "Validation..." : "Valider"}
            </button>
          )}
          {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
        </div>
      </div>
    </div>
  )
}
