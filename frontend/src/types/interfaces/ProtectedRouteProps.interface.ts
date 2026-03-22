import React from 'react';
import { UserRole } from '../enums/UserRole.enum';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}