import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ValidationErrors, validateRegistration } from '../../utils/validation';
import { RegisterFormData } from '../../types/interfaces/auth/RegisterFormData.interface';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next"
import { Typography } from '@/components/ui/typography';
import { Link } from '@/components/ui/link';
import { Input } from '@/components/ui/input';

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
            setSuccessMessage(t('RegistrationSuccessful'));
            setTimeout(() => {
                navigate('/confirm-email');
            }, 2000);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('RegistrationError');
            setErrors({ submit: message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row lg:w-full">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b items-center justify-center p-4">
                <Typography variant="h1" className="text-9xl font-bold text-white font-space-grotesk">{t('CYNA')}</Typography>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="lg:hidden mb-8">
                    <Typography variant="h1" className="text-9xl font-bold text-gray-900 font-space-grotesk">{t('CYNA')}</Typography>
                </div>

                <div className="w-full max-w-sm">
                    <Typography variant="h2">{t("welcome")}</Typography>

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
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                {t("fullName")}
                            </label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                aria-invalid={!!errors.fullName}
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                {t("email")}
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="user@example.com"
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                {t("password")}
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                aria-invalid={!!errors.password}
                            />
                            <Typography variant="body" className="text-xs text-gray-500 mt-2">
                                {t('PasswordRequirements')}
                            </Typography>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                {t("confirmPassword")}
                            </label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                aria-invalid={!!errors.confirmPassword}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            variant="cyna"
                        >
                            {isLoading ? t('RegistrationInProgress') : t('register')}
                        </Button>
                    </form>

                    <p className="text-center text-gray-600 text-sm mt-6">
                        {t("alreadyHaveAccount")}{' '}
                        <Link to="/login">
                            {t("login")}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}