export interface ValidationErrors {
    [key: string]: string;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateEmail = (email: string): string | null => {
    if (!email) return 'L\'email est requis';
    if (!emailRegex.test(email)) return 'L\'email n\'est pas valide';
    return null;
}

export const validatePassword = (password: string): string | null => {
    if (!password) return 'Le mot de passe est requis';
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule';
    if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
    if (!/\d/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
    if (!/[@$!%*?&]/.test(password)) return 'Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)';
    return null;
}

export const validateFullName = (fullName: string): string | null => {
  if (!fullName) return 'Le nom est requis';
  if (fullName.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
  if (fullName.length > 100) return 'Le nom ne peut pas dépasser 100 caractères';
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas';
    return null;
}

export const validateRegistration = (
    email: string,
    password: string,
    confirmPassword: string,
    fullName: string
): ValidationErrors => {
    const errors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validatePasswordMatch(password, confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    const nameError = validateFullName(fullName);
    if (nameError) errors.fullName = nameError;

    return errors;
}

export const validateLogin = (email: string, password: string): ValidationErrors => {
    const errors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    if (!password) errors.password = 'Le mot de passe est requis';

    return errors;
}