import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  CheckoutContext,
  emptyAddress,
} from "@/contexts/CheckoutContext"
import { useAuth } from "@/hooks/useAuth"
import { getAddresses } from "@/services/addressService"
import type { AddressFormData } from "@/types/interfaces/Checkout/AddressFormData"
import type { CheckoutContextValue, CheckoutIds } from "@/types/interfaces/Checkout/CheckoutContextValue"
import type { ConfirmedOrder } from "@/types/interfaces/CheckoutConfirmation/ConfirmedOrder"

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuth()

  const [billingAddress, setBillingAddressState] = useState<AddressFormData>(emptyAddress)
  const [shippingAddress, setShippingAddressState] = useState<AddressFormData>(emptyAddress)
  const [sameAddress, setSameAddressState] = useState(false)
  const [loading, setLoadingState] = useState(false)
  const [error, setErrorState] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrderState] = useState<ConfirmedOrder | null>(null)
  const [checkoutIds, setCheckoutIds] = useState<CheckoutIds | null>(null)
  const [isLoadingContext, setIsLoadingContext] = useState(false)

  // Fetches addresses only — works regardless of cart state.
  // cartId comes from CartContext (useCart) which is populated via authCart.fetchCart().
  const fetchCheckoutContext = useCallback(async () => {
    if (!accessToken || !user) return
    setIsLoadingContext(true)
    try {
      const list = await getAddresses(accessToken)
      const nameParts = (user.full_name ?? "").trim().split(/\s+/)
      const firstName = nameParts[0] ?? ""
      const lastName = nameParts.slice(1).join(" ")

      const billing = list.find((a) => a.type === 'billing' && a.is_default) ?? list.find((a) => a.type === 'billing')
      const shipping = list.find((a) => a.type === 'shipping' && a.is_default) ?? list.find((a) => a.type === 'shipping')

      if (billing) {
        setBillingAddressState({
          firstName,
          lastName,
          addressLine1: billing.address_line1,
          city: billing.city,
          postcode: billing.postcode,
          country: billing.country,
        })
      }
      if (shipping) {
        setShippingAddressState({
          firstName,
          lastName,
          addressLine1: shipping.address_line1,
          city: shipping.city,
          postcode: shipping.postcode,
          country: shipping.country,
        })
      }
      if (billing && shipping) {
        setCheckoutIds((prev) => ({
          cartId: prev?.cartId ?? null,
          billingAddressId: billing.id,
          shippingAddressId: shipping.id,
        }))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des adresses"
      setErrorState(message)
    } finally {
      setIsLoadingContext(false)
    }
  }, [accessToken, user])

  // Clear state on logout
  useEffect(() => {
    if (!user) {
      setBillingAddressState(emptyAddress)
      setShippingAddressState(emptyAddress)
      setCheckoutIds(null)
    }
  }, [user])

  const setBillingAddress = useCallback((data: AddressFormData) => {
    setBillingAddressState(data)
  }, [])

  const setShippingAddress = useCallback((data: AddressFormData) => {
    setShippingAddressState(data)
  }, [])

  const setSameAddress = useCallback((value: boolean) => {
    setSameAddressState(value)
  }, [])

  const setLoading = useCallback((value: boolean) => {
    setLoadingState(value)
  }, [])

  const setError = useCallback((value: string | null) => {
    setErrorState(value)
  }, [])

  const setConfirmedOrder = useCallback((value: ConfirmedOrder | null) => {
    setConfirmedOrderState(value)
  }, [])

  const setCheckoutIdsValue = useCallback((value: CheckoutIds | null) => {
    setCheckoutIds(value)
  }, [])

  const resetCheckoutState = useCallback(() => {
    setBillingAddressState(emptyAddress)
    setShippingAddressState(emptyAddress)
    setSameAddressState(false)
    setLoadingState(false)
    setErrorState(null)
    setConfirmedOrderState(null)
    setCheckoutIds(null)
  }, [])

  const value = useMemo<CheckoutContextValue>(
    () => ({
      billingAddress,
      shippingAddress,
      sameAddress,
      loading,
      error,
      confirmedOrder,
      checkoutIds,
      isLoadingContext,
      fetchCheckoutContext,
      setCheckoutIds: setCheckoutIdsValue,
      setBillingAddress,
      setShippingAddress,
      setSameAddress,
      setLoading,
      setError,
      setConfirmedOrder,
      resetCheckoutState,
    }),
    [
      billingAddress,
      shippingAddress,
      sameAddress,
      loading,
      error,
      confirmedOrder,
      checkoutIds,
      isLoadingContext,
      fetchCheckoutContext,
      setCheckoutIdsValue,
      setBillingAddress,
      setShippingAddress,
      setSameAddress,
      setLoading,
      setError,
      setConfirmedOrder,
      resetCheckoutState,
    ]
  )

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}
