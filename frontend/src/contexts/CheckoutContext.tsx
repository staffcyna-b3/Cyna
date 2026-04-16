import { createContext } from "react"
import type { AddressFormData } from "@/types/interfaces/checkout/AddressFormData"
import type { CheckoutContextValue } from "@/types/interfaces/checkout/CheckoutContextValue"

export const emptyAddress: AddressFormData = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  city: "",
  postcode: "",
  country: "",
}

export const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined)
