import type { CreateOrderPayload } from "@/types/interfaces/Order/CreateOrderPayload"
import type { CreateOrderResponse } from "@/types/interfaces/Order/CreateOrderResponse"
import type { CheckoutContext } from "@/types/interfaces/Checkout/CheckoutContext"
import type { UserAddresses } from "@/types/interfaces/address/UserAddresses"
import type { AddressPayload } from "@/types/interfaces/address/AddressPayload"

export class OrderApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'OrderApiError';
  }
}

export interface OrderItem {
  id: string;
  product_name: string | null;
  unit_price: number;
  quantity: number;
  is_recurring: boolean;
}

export interface OrderSummary {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  billing_period: 'monthly' | 'yearly' | null;
  stripe_payment_intent_id: string | null;
  items: OrderItem[];
}

export interface BillingAddressSnapshot {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
}

export interface OrderDetail extends OrderSummary {
  billing_address_snapshot: BillingAddressSnapshot | null;
  payment_last4: string | null;
  payment_brand: string | null;
}

const withAuthHeaders = (token: string): Record<string, string> => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
})

const parseOrderError = async (res: Response): Promise<OrderApiError> => {
  try {
    const body = await res.json();
    return new OrderApiError(res.status, body.error ?? body.message ?? 'Request failed');
  } catch {
    return new OrderApiError(res.status, 'Request failed');
  }
}

const parseJsonResponse = async <T>(res: Response): Promise<T> => {
  const contentType = res.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>
  }
  const bodyPreview = (await res.text()).slice(0, 120)
  throw new OrderApiError(res.status, `Expected JSON but got '${contentType}': ${bodyPreview}`)
}

export async function getOrders(token: string): Promise<OrderSummary[]> {
  const res = await fetch("/api/front-office/orders", {
    headers: withAuthHeaders(token),
  });
  if (res.status === 401) throw new OrderApiError(401, 'UNAUTHORIZED');
  if (!res.ok) throw await parseOrderError(res);
  return parseJsonResponse<OrderSummary[]>(res);
}

export async function getOrderById(token: string, id: string): Promise<OrderDetail> {
  const res = await fetch(`/api/front-office/orders/${id}`, {
    headers: withAuthHeaders(token),
  });
  if (res.status === 401) throw new OrderApiError(401, 'UNAUTHORIZED');
  if (!res.ok) throw await parseOrderError(res);
  return parseJsonResponse<OrderDetail>(res);
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
  if (!res.ok) throw await parseOrderError(res)
  return parseJsonResponse<UserAddresses>(res)
}

export async function getUserAddresses(token: string): Promise<UserAddresses> {
  const res = await fetch("/api/front-office/addresses", {
    headers: withAuthHeaders(token),
  })
  if (!res.ok) throw await parseOrderError(res)
  return parseJsonResponse<UserAddresses>(res)
}

export async function getCheckoutContext(token: string): Promise<CheckoutContext> {
  const res = await fetch("/api/front-office/checkout/context", {
    headers: withAuthHeaders(token),
  })
  if (!res.ok) throw await parseOrderError(res)
  return parseJsonResponse<CheckoutContext>(res)
}

export async function createOrder(payload: CreateOrderPayload, token: string): Promise<CreateOrderResponse> {
  const res = await fetch("/api/front-office/orders", {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw await parseOrderError(res)
  return parseJsonResponse<CreateOrderResponse>(res)
}

export async function getOrder(orderId: string, token: string): Promise<OrderDetail> {
  return getOrderById(token, orderId);
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
  if (!res.ok) throw await parseOrderError(res)
}
