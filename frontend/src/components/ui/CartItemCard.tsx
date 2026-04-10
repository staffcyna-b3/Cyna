import { useTranslation } from 'react-i18next';
import { CartItem } from '@/types/interfaces/cart/CartItem';
import { formatCurrency } from '@/utils/currencyFormatter';
import placeholder from '@/assets/pictures/placeholder.svg';

interface Props {
    item: CartItem;
    onRemove: (itemId: string, productId: string) => void;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const getPeriodLabel = (months: number): string => {
    if (months === 12) return 'an';
    return `${months} mois`;
};

export const CartItemCard = ({ item, onRemove, onUpdateQuantity }: Props) => {
    const { t } = useTranslation();

    const periodLabel = item.period ? getPeriodLabel(item.period) : '';
    const periodTotal = item.period ? item.unitPrice * item.period : item.unitPrice;

    // Texte du prix principal
    const priceDisplay = item.isService && item.period
        ? <>{formatCurrency(periodTotal)} <span className="font-normal text-gray-500 text-sm">/ {periodLabel}</span></>
        : <>{formatCurrency(item.unitPrice)}</>;

    // Texte du sous-total
    const subtotalDisplay = item.isService && item.period
        ? <>{formatCurrency(item.unitPrice)} <span className="text-gray-400 text-xs">/ mois</span></>
        : <>{formatCurrency(item.subtotal)}</>;

    return (
        <div className="mb-4 bg-gray-100 rounded-xl overflow-hidden flex h-36" style={{ color: '#111827' }}>

            {/* Image — 40% */}
            <div className="w-2/5 shrink-0 bg-gray-200 relative">
                <img
                    src={item.imageUrl ?? placeholder}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
                {item.unavailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-xs text-white font-medium px-2 py-1 bg-red-500 rounded-full">
                            {t('cart.unavailable')}
                        </span>
                    </div>
                )}
            </div>

            {/* Contenu — 60% */}
            <div className="flex-1 p-4 flex flex-col justify-between">

                {/* Ligne 1 : nom + supprimer */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                    <button
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        onClick={() => onRemove(item.id, item.productId)}
                    >
                        {t('cart.remove')}
                    </button>
                </div>

                {/* Ligne 2 : prix */}
                <p className="font-semibold text-gray-900 text-sm">{priceDisplay}</p>

                {/* Ligne 3 : quantité + sous-total */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-full">
                        <button
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full text-base transition-colors"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                            −
                        </button>
                        <span className="w-6 text-center font-medium text-xs text-gray-900">{item.quantity}</span>
                        <button
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full text-base transition-colors"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                    <span className="text-xs text-gray-500">
                        {t('cart.subtotal')} : <span className="font-semibold text-gray-900">{subtotalDisplay}</span>
                    </span>
                </div>

            </div>
        </div>
    );
};
