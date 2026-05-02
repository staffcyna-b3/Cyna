import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ValidationErrors, validatePassword, validatePasswordMatch } from '../../utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '../../components/ui/input';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/hooks/useAuth';

interface ResetFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { validateResetToken, resetPassword } = useAuth();

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<ResetFormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const token = searchParams.get('token');

  // Valider le token au chargement
  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      const isValid = await validateResetToken(token);
      setTokenValid(isValid);
    };

    validate();
  }, [token, validateResetToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    // Validations
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validatePasswordMatch(formData.password, formData.confirmPassword);

    const newErrors: ValidationErrors = {};

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token!, formData.password);
      setSuccessMessage(t('passwordResetSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('passwordResetError');
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Token invalide
  if (tokenValid === false) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-950 to-blue-900 items-center justify-center p-4">
          <Typography variant="h1" className="text-9xl font-bold text-white">
            {t('CYNA')}
          </Typography>
        </div>

        <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <Typography variant="h2" className="text-2xl font-bold text-gray-900 mb-2">
              {t('invalidLink')}
            </Typography>
            <Typography variant="body" className="text-gray-600 mb-6">
              {t('InvalidOrExpiredLink')}
            </Typography>
            <a
              href="/request-reset"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t('requestNewLink')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Chargement
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Formulaire valide
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
          <Typography variant="h2" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center lg:text-left">
            {t('newPassword')}
          </Typography>

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPassword')}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                disabled={isLoading}
              />
              <Typography variant="body" className="text-xs text-gray-500 mt-1">
                {t('PasswordRequirements')}
              </Typography>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword')}
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? t('resettingPassword') : t('resetPassword')}
            </Button>
          </form>

          {/* Lien retour login */}
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