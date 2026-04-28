import { Request, Response, NextFunction } from 'express'; // CHANGED: add role-based middleware for sales access

export const requireRoles = (roles: string[]) => // CHANGED: accept allowed roles list
  (req: Request, res: Response, next: NextFunction): void => { // CHANGED: return middleware handler
    const role = req.headers['x-user-role'] as string | undefined; // CHANGED: read role from gateway headers
    if (!role || !roles.includes(role)) { // CHANGED: enforce role presence and allow list
      res.status(403).json({ success: false, message: 'Forbidden: insufficient role' }); // CHANGED: standardized forbidden response
      return; // CHANGED: stop pipeline on insufficient role
    }
    next(); // CHANGED: allow request to continue
  }; // CHANGED: end requireRoles middleware
