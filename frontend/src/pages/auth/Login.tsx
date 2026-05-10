import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ValidationErrors, validateLogin } from '../../utils/validation';
import { LoginFormData } from '../../types/interfaces/auth/LoginFormData.interface';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next"
import { Typography } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '../../types/enums/UserRole.enum';
import { Field, FieldError } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Link } from '@/components/ui/link';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
    const { login, user, isAuthenticated, isLoading } = useAuth();
    const { t } = useTranslation();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            if (user.role === UserRole.ADMIN || user.role === UserRole.COMMERCIAL) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, isLoading, user, navigate]);

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });

    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);

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
            setIsSubmitting(false);
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
                        <Field>
                            <Label htmlFor="email" >
                                {t("email")}
                            </Label>
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
                                <FieldError>{errors.email}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <Label htmlFor="password">
                                {t("password")}
                            </Label>
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
                                <FieldError>{errors.password}</FieldError>
                            )}
                        </Field>

                        <Field orientation={'horizontal'}>
                            <Checkbox
                                id="rememberMe"
                                checked={rememberMe}
                                onCheckedChange={(val) => setRememberMe(val === true)}
                            />
                            <Label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                                {t("rememberMe")}
                            </Label>
                        </Field>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant="cyna"
                        >
                            {isSubmitting ? t('loggingIn') : t('login')}
                        </Button>
                    </form>

                    <div className='flex flex-col items-center gap-1 mt-2'>
                        <div className='flex gap-1 items-center mb-2'>
                            <Typography variant='body' className='text-sm'>{t("noAccount")}</Typography>
                            <NavLink to='/register' className={'text-sm'}>{t("register")}</NavLink>
                        </div>
                        <NavLink to='/request-reset' className={'text-sm'}>{t("forgottenPassword")}</NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
}