import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ValidationErrors, validateRegistration } from '../../utils/validation';
import { RegisterFormData } from '../../types/interfaces/auth.types';
import { Button } from '@/components/ui/button';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

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
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Créer un compte
                </h1>

                {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {successMessage}
                </div>
                )}

                {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.submit}
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                    </label>
                    <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    />
                    {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                    </label>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    />
                    {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                    </label>
                    <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    />
                    {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                    Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                    </p>
                </div>

                <div>
                    <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    >
                    Confirmer le mot de passe
                    </label>
                    <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                </div>
                    <Button>Bouton</Button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                Vous avez déjà un compte ?{' '}
                <a href="/login" className="text-blue-600 hover:underline font-medium">
                    Se connecter
                </a>
                </p>
            </div>
        </div>
    )
}