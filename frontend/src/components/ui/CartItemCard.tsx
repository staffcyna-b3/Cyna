import { useTranslation } from 'react-i18next';
import { CartItem } from '@/types/interfaces/cart/CartItem';
import { getAllSaaSDurations } from '@/lib/cartStorage';
import { formatCurrency } from '@/utils/currencyFormatter';

interface Props {
    item: CartItem;
    onRemove: (itemId: string, productId: string) => void;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export const CartItemCard = ({ item, onRemove, onUpdateQuantity }: Props) => {
    const { t } = useTranslation();

    const saasDurations = getAllSaaSDurations();
    const currentDuration = saasDurations[item.product_id];
    const itemTotal = item.price * item.quantity;

    return (
        <div className="mb-4 bg-gray-100 rounded-xl p-6 flex flex-col gap-4">

            {/* Ligne 1 : nom + supprimer */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.price)}</p>
                </div>
                <button
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => onRemove(item.id, item.product_id)}
                >
                    {t('cart.remove')}
                </button>
            </div>

            {/* Ligne 2 : badge billing (services uniquement) */}
            {item.is_service && currentDuration && (
                <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-full text-gray-700 cursor-pointer">
                        {currentDuration}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
            )}

            {/* Ligne 3 : quantité + sous-total */}
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-full">
                    <button
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full text-xl"
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                        −
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full text-xl"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        +
                    </button>
                </div>

                <span className="text-sm text-gray-500">
                    {t('cart.subtotal')} :{' '}
                    <span className="font-semibold text-gray-900">
                        {formatCurrency(itemTotal)}
                    </span>
                </span>
            </div>
        </div>
    );
};