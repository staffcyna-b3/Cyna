export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export class UserApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'UserApiError';
  }
}

const withAuth = (token: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const parseError = async (res: Response): Promise<UserApiError> => {
  try {
    const body = await res.json();
    return new UserApiError(res.status, body.error ?? body.message ?? 'Request failed');
  } catch {
    return new UserApiError(res.status, 'Request failed');
  }
};

export async function getProfile(token: string): Promise<UserProfile> {
  const res = await fetch('/api/auth/me', { headers: withAuth(token) });
  if (!res.ok) throw await parseError(res);
  const body = await res.json();
  return body.data.user as UserProfile;
}

export async function updateProfile(token: string, data: UpdateProfilePayload): Promise<UserProfile> {
  const res = await fetch('/api/auth/me', {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await parseError(res);
  const body = await res.json();
  return body.data.user as UserProfile;
}

export async function changePassword(token: string, data: ChangePasswordPayload): Promise<void> {
  const res = await fetch('/api/auth/password', {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await parseError(res);
}
