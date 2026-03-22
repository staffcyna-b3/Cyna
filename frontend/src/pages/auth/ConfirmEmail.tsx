import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/typography';

export const ConfirmEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmEmail } = useAuth();
  const { t } = useTranslation();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const confirmEmailHandler = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('ErrorTokenMissing'));
        return;
      }

      try {
        await confirmEmail(token);
        setStatus('success');
        setMessage(t('EmailConfirmed'));

        // Rediriger vers login après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : t('ErrorConfirmationFailed');
        setMessage(errorMessage);
      }
    };

    confirmEmailHandler();
  }, [searchParams, confirmEmail, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Section gauche: Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-950 to-blue-900 items-center justify-center p-4">
          <Typography variant="h1" className="text-white">
            {t('CYNA')}
          </Typography>
      </div>

      {/* Section droite: Message */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="lg:hidden mb-8">
          <Typography variant="h1" className="text-4xl font-bold text-gray-900">
            {t('CYNA')}
          </Typography>
        </div>

        <div className="w-full max-w-sm">
          <Typography variant="h2" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center lg:text-left">
            {t('ConfirmEmail')}
          </Typography>

          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
              <Typography variant="body" className="text-gray-600">
                {t('VerificationInProgress')}
              </Typography>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <Typography variant="body" className="text-green-600 font-semibold mb-4">
                {message}
              </Typography>
              <Typography variant="body" className="text-gray-600 text-sm">
                {t('RedirectingToLogin')}
              </Typography>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <Typography variant="body" className="text-red-600 font-semibold mb-4">
                {message}
              </Typography>
              <div className="space-y-3">
                <Typography variant="body" className="text-gray-600 text-sm">
                  {t('InvalidOrExpiredLink')}
                </Typography>
                <a
                  href="/register"
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {t('ResendConfirmation')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};