export interface User {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  role: 'ADMIN' | 'COMMERCIAL' | 'USER';
}