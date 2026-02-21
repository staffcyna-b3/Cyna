import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ValidationErrors, validateRegistration } from '../../utils/validation';
import { RegisterFormData } from '../../types/interfaces/auth.types';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next"

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { t } =  useTranslation();

    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Nettoyer l'erreur pour le champ quand l'utilisateur commence à saisir
        if(errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage(null);

        const validationErrors = validateRegistration(
            formData.email,
            formData.password,
            formData.confirmPassword,
            formData.fullName
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            await register(formData.email, formData.password, formData.fullName);
            setSuccessMessage('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
            setTimeout(() => {
                navigate('/confirm-email');
            }, 2000);
        } catch (error: any) {
            const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
            setErrors({ submit: message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-950 to-blue-900 items-center justify-center p-4">
                <h1 className="text-6xl font-bold text-white">CYNA.</h1>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="lg:hidden mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">CYNA.</h1>
                </div>

                <div className="w-full max-w-sm">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center lg:text-left">
                        {t("welcome")}
                    </h2>

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
                            <label 
                                htmlFor="fullName" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t("fullName")}
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                disabled={isLoading}
                                className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                }`}
                            />
                            {errors.fullName && (
                                <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                            )}
                        </div>

                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t("email")}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="user@example.com"
                                disabled={isLoading}
                                className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t("password")}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                }`}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t("confirmPassword")}
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                }`}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? 'Inscription en cours...' : t('register')}
                        </Button>
                    </form>

                    <p className="text-center text-gray-600 text-sm mt-6">
                        {t("alreadyHaveAccount")}{' '}
                        <a 
                            href="/login" 
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                            Connectez-vous.
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}