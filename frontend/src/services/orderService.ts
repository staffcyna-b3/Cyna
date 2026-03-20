import type { CreateOrderPayload } from "@/types/interfaces/Order/CreateOrderPayload"
import type { CreateOrderResponse } from "@/types/interfaces/Order/CreateOrderResponse"
import type { GetOrderResponse } from "@/types/interfaces/Order/GetOrderResponse"
import type { CheckoutContext } from "@/types/interfaces/Checkout/CheckoutContext"

const API_URL = import.meta.env.VITE_GATEWAY_URL

const withAuthHeaders = () => {
  // TODO: DESIR — replace with auth context once gateway JWT PR is merged
  // and inject real Bearer token from authenticated user session.
  return {
    "Content-Type": "application/json",
  }
}

const parseError = async (res: Response) => {
  try {
    const payload = await res.json()
    return payload
  } catch {
    return { message: "Request failed" }
  }
}

const getApiUrl = () => {
  if (!API_URL || typeof API_URL !== "string" || API_URL.trim().length === 0) {
    throw new Error("Missing VITE_GATEWAY_URL. Configure frontend env before calling API.")
  }

  return API_URL
}

const parseJsonResponse = async <T>(res: Response): Promise<T> => {
  const contentType = res.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>
  }

  const bodyPreview = (await res.text()).slice(0, 120)
  throw new Error(`Expected JSON response but received '${contentType || "unknown"}': ${bodyPreview}`)
}

export async function getCheckoutContext(): Promise<CheckoutContext> {
  const apiUrl = getApiUrl()
  const res = await fetch(`${apiUrl}/front-office/checkout/context`, {
    headers: withAuthHeaders(),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<CheckoutContext>(res)
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const apiUrl = getApiUrl()
  const res = await fetch(`${apiUrl}/front-office/orders`, {
    method: "POST",
    headers: withAuthHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<CreateOrderResponse>(res)
}

export async function getOrder(orderId: string): Promise<GetOrderResponse> {
  const apiUrl = getApiUrl()
  const res = await fetch(`${apiUrl}/front-office/orders/${orderId}`, {
    headers: withAuthHeaders(),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return parseJsonResponse<GetOrderResponse>(res)
}
