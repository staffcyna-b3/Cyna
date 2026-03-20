import { useCallback, useMemo, useState, type ReactNode } from "react"
import {
  CheckoutContext,
  emptyAddress,
} from "@/contexts/CheckoutContext"
import type { AddressFormData } from "@/types/interfaces/Checkout/AddressFormData"
import type { CheckoutContextValue } from "@/types/interfaces/Checkout/CheckoutContextValue"
import type { ConfirmedOrder } from "@/types/interfaces/CheckoutConfirmation/ConfirmedOrder"

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [billingAddress, setBillingAddressState] = useState<AddressFormData>(emptyAddress)
  const [shippingAddress, setShippingAddressState] = useState<AddressFormData>(emptyAddress)
  const [sameAddress, setSameAddressState] = useState(false)
  const [loading, setLoadingState] = useState(false)
  const [error, setErrorState] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrderState] = useState<ConfirmedOrder | null>(null)

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

  const resetCheckoutState = useCallback(() => {
    setBillingAddressState(emptyAddress)
    setShippingAddressState(emptyAddress)
    setSameAddressState(false)
    setLoadingState(false)
    setErrorState(null)
    setConfirmedOrderState(null)
  }, [])

  const value = useMemo<CheckoutContextValue>(
    () => ({
      billingAddress,
      shippingAddress,
      sameAddress,
      loading,
      error,
      confirmedOrder,
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
