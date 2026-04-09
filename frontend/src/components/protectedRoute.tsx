import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../types/enums/UserRole.enum';
import { ProtectedRouteProps } from '../types/interfaces/ProtectedRouteProps.interface';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [UserRole.ADMIN, UserRole.COMMERCIAL]
}) => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && (!user.role || !requiredRoles.includes(user.role as UserRole))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};