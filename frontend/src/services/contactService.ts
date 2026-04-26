export class ContactApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ContactApiError';
  }
}

async function parseError(res: Response): Promise<ContactApiError> {
  try {
    const body = await res.json();
    return new ContactApiError(res.status, body.error ?? body.message ?? 'REQUEST_FAILED');
  } catch {
    return new ContactApiError(res.status, 'REQUEST_FAILED');
  }
}

export async function submitContact(data: {
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const res = await fetch('/api/front-office/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await parseError(res);
}
