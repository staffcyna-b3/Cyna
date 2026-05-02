import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

export const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <Typography variant="h2" className="mb-4">
        {t('accessDenied', 'Accès refusé')}
      </Typography>
      <Typography variant="body" className="text-gray-600 mb-8">
        {t('accessDeniedMessage', "Vous n'avez pas les droits nécessaires pour accéder à cette page.")}
      </Typography>
      <Button variant="cyna" asChild>
        <Link to="/">{t('backToHome', "Retour à l'accueil")}</Link>
      </Button>
    </div>
  );
};
