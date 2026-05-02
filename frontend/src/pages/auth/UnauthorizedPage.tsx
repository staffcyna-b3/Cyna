import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldOff, ArrowRight } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(to right, #0B0925 0%, #29228B 33%, #0B0925 66%, #0B0925 100%)' }}
    >
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10">
          <ShieldOff size={40} className="text-white/80" />
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
          403
        </span>

        <h1 className="font-space-grotesk text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          {t('accessDenied', 'Accès refusé')}
        </h1>

        <p className="text-base leading-relaxed text-white/70">
          {t('accessDeniedMessage', "Vous n'avez pas les droits nécessaires pour accéder à cette page.")}
        </p>

        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#372CCA] shadow-lg transition hover:bg-white/90 hover:shadow-xl"
        >
          {t('backToHome', "Retour à l'accueil")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
