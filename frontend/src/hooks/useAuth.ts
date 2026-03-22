import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';
import i18n from '../i18n';

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error(i18n.t('useAuthMustBeUsed'));
    }
    return context;
};