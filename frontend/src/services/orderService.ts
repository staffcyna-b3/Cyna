import type { CreateOrderPayload } from "@/types/interfaces/order/CreateOrderPayload"
import type { CreateOrderResponse } from "@/types/interfaces/order/CreateOrderResponse"
import type { GetOrderResponse } from "@/types/GetOrderResponse"
import type { CheckoutContext } from "@/types/interfaces/checkout/CheckoutContext"
import type { UserAddresses } from "@/types/interfaces/address/UserAddresses"
import type { AddressPayload } from "@/types/interfaces/address/AddressPayload"

const withAuthHeaders = (token: string): Record<string, string> => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
})

const parseError = async (res: Response) => {
  try {
    const payload = await res.json()
    return { ...payload, status: res.status }
  } catch {
    return { message: "Request failed", status: res.status }
  }
}

const parseJsonResponse = async <T>(res: Response): Promise<T> => {
  const contentType = res.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>
  }

  const bodyPreview = (await res.text()).slice(0, 120)
  throw new Error(`Expected JSON response but received '${contentType || "unknown"}': ${bodyPreview}`)
}

export async function saveAddresses(
  billing: AddressPayload,
  shipping: AddressPayload,
  token: string
): Promise<UserAddresses> {
  const res = await fetch("/api/front-office/addresses", {
    method: "PUT",
    headers: withAuthHeaders(token),
    body: JSON.stringify({ billing, shipping }),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<UserAddresses>(res)
}

export async function getUserAddresses(token: string): Promise<UserAddresses> {
  const res = await fetch("/api/front-office/addresses", {
    headers: withAuthHeaders(token),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<UserAddresses>(res)
}

export async function getCheckoutContext(token: string): Promise<CheckoutContext> {
  const res = await fetch("/api/front-office/checkout/context", {
    headers: withAuthHeaders(token),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<CheckoutContext>(res)
}

export async function createOrder(payload: CreateOrderPayload, token: string): Promise<CreateOrderResponse> {
  const res = await fetch("/api/front-office/orders", {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<CreateOrderResponse>(res)
}

export async function getOrder(orderId: string, token: string): Promise<GetOrderResponse> {
  const res = await fetch(`/api/front-office/orders/${orderId}`, {
    headers: withAuthHeaders(token),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<GetOrderResponse>(res)
}

export async function updateOrderStatus(
  orderId: string,
  status: 'PAID' | 'CANCELLED',
  token: string
): Promise<void> {
  const res = await fetch(`/api/front-office/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: withAuthHeaders(token),
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    throw await parseError(res)
  }
}
