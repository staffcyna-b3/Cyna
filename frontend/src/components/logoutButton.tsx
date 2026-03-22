import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="destructive"
    >
      {t('logout')}
    </Button>
  );
};