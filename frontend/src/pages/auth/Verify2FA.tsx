import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const Verify2FA: React.FC = () => {
  const navigate = useNavigate();
  const { user, verify2FA } = useAuth();
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const userId = sessionStorage.getItem('pending_2fa_user_id');
  const email = sessionStorage.getItem('pending_2fa_email');

  useEffect(() => {
    // Rediriger quand l'utilisateur est connecté
    if (user) {
      navigate('/');
    }
  }, [userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code || code.length !== 6) {
      setError(t('wrongCodeFormat'));
      return;
    }

    setIsLoading(true);

    try {
      await verify2FA(userId!, code);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('ErrorVerifying2FA');
      console.error('Erreur 2FA:', message);
      setError(message);
      setAttempts((prev) => prev + 1);
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Section gauche: Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-950 to-blue-900 items-center justify-center p-4">
        <h1 className="text-6xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          CYNA.
        </h1>
      </div>

      {/* Section droite: Formulaire */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="lg:hidden mb-8">
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            CYNA.
          </h1>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">
            {t('verify2FA')}
          </h2>
          <p className="text-gray-600 text-sm mb-8 text-center lg:text-left">
            {t('verificationCodeSent')} {email ? `(${email})` : ''}.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
              {attempts >= 3 && (
                <div className="mt-2">
                  <a href="/login" className="text-red-600 hover:text-red-700 font-semibold">
                    {t('backToLogin')}
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                {t('verificationCode')}
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                disabled={isLoading || attempts >= 3}
                className="w-full h-11 rounded-[10px] border-2 border-gray-300 p-2.5 text-center text-2xl tracking-widest placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:border-[#3632F5] focus-visible:ring-[#3632F5] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                {t('attemptsRemaining')}: {3 - attempts}/3
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || code.length !== 6 || attempts >= 3}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? t('verifying2FA') : t('verify2FA')}
            </Button>
          </form>

          {/* Lien retour */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                {t('backToLogin')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};