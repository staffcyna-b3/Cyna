import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

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
        setMessage('Token manquant');
        return;
      }

      try {
        await confirmEmail(token);
        setStatus('success');
        setMessage('Email confirmé avec succès !');

        // Rediriger vers login après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la confirmation';
        setMessage(errorMessage);
      }
    };

    confirmEmailHandler();
  }, [searchParams, confirmEmail, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Section gauche: Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-950 to-blue-900 items-center justify-center p-4">
        <h1 className="text-6xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          CYNA.
        </h1>
      </div>

      {/* Section droite: Message */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="lg:hidden mb-8">
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            CYNA.
          </h1>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center lg:text-left">
            Confirmation d'email
          </h2>

          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600">Vérification en cours...</p>
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
              <p className="text-green-600 font-semibold mb-4">{message}</p>
              <p className="text-gray-600 text-sm">Redirection vers la connexion...</p>
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
              <p className="text-red-600 font-semibold mb-4">{message}</p>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">Le lien a expiré ou est invalide.</p>
                <a
                  href="/register"
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Réessayer l'inscription
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};