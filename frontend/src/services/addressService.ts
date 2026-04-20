export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
}

export interface CreateAddressPayload {
  type: 'billing' | 'shipping';
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default?: boolean;
}

const withAuth = (token: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export class AddressApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const parseError = async (res: Response): Promise<AddressApiError> => {
  try {
    const body = await res.json();
    return new AddressApiError(res.status, body.message ?? 'Request failed');
  } catch {
    return new AddressApiError(res.status, 'Request failed');
  }
};

export async function getAddresses(token: string): Promise<Address[]> {
  const res = await fetch('/api/front-office/addresses', { headers: withAuth(token) });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function createAddress(token: string, data: CreateAddressPayload): Promise<Address> {
  const res = await fetch('/api/front-office/addresses', {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function updateAddress(
  token: string,
  id: string,
  data: Partial<CreateAddressPayload>
): Promise<Address> {
  const res = await fetch(`/api/front-office/addresses/${id}`, {
    method: 'PUT',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function deleteAddress(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/front-office/addresses/${id}`, {
    method: 'DELETE',
    headers: withAuth(token),
  });
  if (!res.ok) throw await parseError(res);
}

export async function setDefaultAddress(token: string, id: string): Promise<Address> {
  const res = await fetch(`/api/front-office/addresses/${id}/default`, {
    method: 'PATCH',
    headers: withAuth(token),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}
