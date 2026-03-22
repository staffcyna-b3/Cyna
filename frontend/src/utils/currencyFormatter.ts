import i18n from '@/i18n';

export const createCurrencyFormatter = (currency: string = 'EUR') => {
    return new Intl.NumberFormat(i18n.language || 'en', {
        style: 'currency',
        currency,
    });
};

export const formatCurrency = (
    amount: number,
    currency: string = 'EUR'
): string => {
    const formatter = createCurrencyFormatter(currency);
    return formatter.format(amount);
};

export const formatPrice = (price: number): string => {
    return formatCurrency(price, 'EUR');
};
