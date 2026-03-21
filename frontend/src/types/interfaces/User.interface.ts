import { UserRole } from "../enums/UserRole.enum";

export interface User {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  role: UserRole;
}