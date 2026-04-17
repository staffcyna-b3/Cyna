import 'express';
import { UserRoleType } from '../enum/UserRoleType.enum';

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
    user?: {
      userId: string;
      email: string;
      role?: UserRoleType;
    };
  }
}
