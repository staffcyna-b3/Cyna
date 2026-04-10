import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import i18n from '@/i18n';

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error(i18n.t('useCartMustBeUsed') || 'useCart must be used within a CartProvider');
    }
    return context;
};

export default useCart;