import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, ValidationErrors } from '../../utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '../../components/ui/input';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/typography';

export const RequestReset: React.FC = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    const validationErrors = validateEmail(email);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const data = await requestPasswordReset(email);
      setSuccessMessage(data.message || t('requestNewLinkSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('requestNewLinkError');
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Section gauche: Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-950 to-blue-900 items-center justify-center p-4">
        <Typography variant="h1" className="text-9xl font-bold text-white">
          {t('CYNA')}
        </Typography>
      </div>

      {/* Section droite: Formulaire */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="lg:hidden mb-8">
          <Typography variant="h1" className="text-9xl font-bold text-gray-900">
            {t('CYNA')}
          </Typography>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">
            {t('forgottenPassword')}
          </h2>
          <p className="text-gray-600 text-sm mb-8 text-center lg:text-left">
            {t('requestNewLinkDescription')}
          </p>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="user@example.com"
                aria-invalid={!!errors.email}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? t('sendingLink') : t('sendResetLink')}
            </Button>
          </form>

          {/* Lien retour login */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              {t('alreadyHaveAccount')}{' '}
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