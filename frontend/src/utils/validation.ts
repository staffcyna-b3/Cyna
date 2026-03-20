import i18n from '../i18n';

export interface ValidationErrors {
    [key: string]: string;
}

const t = (key: string): string => i18n.t(key);

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateEmail = (email: string): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!email) {
        errors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = t('emailInvalid');
    }

    return errors;
}

export const validatePassword = (password: string): string | null => {
    if (!password) return t('passwordRequired');
    if (password.length < 8) return t('passwordTooShort');
    if (!/[a-z]/.test(password)) return t('passwordMissingLowercase');
    if (!/[A-Z]/.test(password)) return t('passwordMissingUppercase');
    if (!/\d/.test(password)) return t('passwordMissingNumber');
    if (!/[@$!%*?&]/.test(password)) return t('passwordMissingSpecialCharacter');
    return null;
}

export const validateFullName = (fullName: string): string | null => {
  if (!fullName) return t('fullNameRequired');
  if (fullName.trim().length < 2) return t('fullNameTooShort');
  if (fullName.length > 100) return t('fullNameTooLong');
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) return t('passwordsDoNotMatch');
    return null;
}

export const validateRegistration = (
    email: string,
    password: string,
    confirmPassword: string,
    fullName: string
): ValidationErrors => {
    let errors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (Object.keys(emailError).length > 0) {
        errors = { ...errors, ...emailError };
    }

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validatePasswordMatch(password, confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    const nameError = validateFullName(fullName);
    if (nameError) errors.fullName = nameError;

    return errors;
}

export const validateLogin = (email: string, password: string): ValidationErrors => {
    let errors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (Object.keys(emailError).length > 0) {
        errors = { ...errors, ...emailError }; 
    }

    if (!password) errors.password = t('passwordRequired');

    return errors;
}