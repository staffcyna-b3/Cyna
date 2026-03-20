import { getFrontToken } from "@/lib/frontAuth"

const API_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:3000/api/front-office"

type CreateOrderPayload = {
  cartId: string
  billingAddressId: string
  shippingAddressId: string
}

type LoginPayload = {
  email: string
  password: string
}

export type CheckoutContext = {
  user: {
    id: string
    email: string
    fullName?: string
  }
  cart: {
    id: string
    items: Array<{
      id: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
    }>
  }
  addresses: {
    billing: {
      id: string
      addressLine1: string
      city: string
      postcode: string
      country: string
    }
    shipping: {
      id: string
      addressLine1: string
      city: string
      postcode: string
      country: string
    }
  }
  checkout: {
    cartId: string
    billingAddressId: string
    shippingAddressId: string
  }
}

const withAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getFrontToken() ?? ""}`,
})

const parseError = async (res: Response) => {
  try {
    const payload = await res.json()
    return payload
  } catch {
    return { message: "Request failed" }
  }
}

export async function login(payload: LoginPayload) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return res.json()
}

export async function getCheckoutContext(): Promise<CheckoutContext> {
  const res = await fetch(`${API_URL}/checkout/context`, {
    headers: withAuthHeaders(),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return res.json()
}

export async function createOrder(payload: CreateOrderPayload) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: withAuthHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return res.json()
}

export async function getOrder(orderId: string) {
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: withAuthHeaders(),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return res.json()
}
