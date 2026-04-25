import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
    user?: {
      userId: string;
      email: string;
    };
  }
}
