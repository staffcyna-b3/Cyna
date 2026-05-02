import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ValidationErrors, validateLogin } from '../../utils/validation';
import { LoginFormData } from '../../types/interfaces/auth/LoginFormData.interface';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next"
import { Typography } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
    const { login } = useAuth();
    const { t } = useTranslation();

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });

    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);

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
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = validateLogin(formData.email, formData.password);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            await login(formData.email, formData.password, rememberMe);
            
            // Vérifier si 2FA est requis (en cherchant le sessionId)
            const sessionId = sessionStorage.getItem('pending_2fa_session_id');
            if (sessionId) {
              navigate('/verify-2fa', { state: { from: location.state?.from } });
            } else {
              navigate(from, { replace: true });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('ErrorLoggingIn');
            setErrors({ submit: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row lg:w-full">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b items-center justify-center p-4">
                <Typography variant="h1" className="text-9xl font-bold text-white font-space-grotesk">
                    {t('CYNA')}
                </Typography>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="lg:hidden mb-8">
                    <Typography variant="h1" className="text-9xl font-bold text-gray-900 font-space-grotesk">
                        {t('CYNA')}
                    </Typography>
                </div>

                <div className="w-full max-w-sm">
                    <Typography variant="h2">{t("welcome")}</Typography>

                    {errors.submit && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="rememberMe"
                                checked={rememberMe}
                                onCheckedChange={(val) => setRememberMe(val === true)}
                            />
                            <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                                {t("rememberMe")}
                            </label>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            variant="cyna"
                        >
                            {isLoading ? t('loggingIn') : t('login')}
                        </Button>
                    </form>

                    <a href="/request-reset" className="text-center text-gray-600 text-sm mt-6">
                        {t("forgottenPassword")}{' '}
                    </a>
                    <a href="/register" className="text-center text-gray-600 text-sm mt-6">
                        {t("noAccount", "Pas encore de compte ? S'inscrire")}
                    </a>
                </div>
            </div>
        </div>
    )
}