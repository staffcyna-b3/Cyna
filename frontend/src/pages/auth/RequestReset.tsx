import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, ValidationErrors } from '../../utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '../../components/ui/input';
import { useTranslation } from 'react-i18next';
import { RequestResetFormData } from '../../types/interfaces/auth.types';

export const RequestReset: React.FC = () => {
  const navigate = useNavigate();
  const { error: authError, clearError } = useAuth();
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
    clearError();

    const validationErrors = validateEmail(email);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la demande');
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Vérifiez votre email pour réinitialiser votre mot de passe');

      // Rediriger après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la demande';
      setErrors({ submit: message });
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
            Mot de passe oublié ?
          </h2>
          <p className="text-gray-600 text-sm mb-8 text-center lg:text-left">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
            {/* Email */}
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="user@example.com"
              label="Email"
              error={errors.email}
              disabled={isLoading}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </form>

          {/* Lien retour login */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Vous vous souvenez de votre mot de passe ?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};