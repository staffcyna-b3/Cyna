import { createContext } from "react"
import type { AddressFormData } from "@/types/interfaces/Checkout/AddressFormData"
import type { CheckoutContextValue } from "@/types/interfaces/Checkout/CheckoutContextValue"

export const emptyAddress: AddressFormData = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  city: "",
  postcode: "",
  country: "",
}

export const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined)
