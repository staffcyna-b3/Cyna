import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/useCart';
import { CartItemCard } from '@/components/ui/CartItemCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/currencyFormatter';

export default function CartPage() {
    const { t } = useTranslation();
    const { items, totalAmount, updateQuantity, removeFromCart, isLoading } = useCart();
    const navigate = useNavigate();

    const hasUnavailableItems = items.some((item) => item.unavailable);

    if (isLoading) return <div className="p-8 text-center text-gray-500">{t('loading')}</div>;

    return (
        <>
        <style>{`
            .cart-page, .cart-page * { color: #111827 !important; }
            .cart-summary, .cart-summary * { color: #ffffff !important; }
        `}</style>
        <div className="cart-page min-h-screen bg-white">
        <div className="container mx-auto p-8 max-w-6xl">
            {items.length === 0 ? (
                <div className="text-center py-20">
                    <h1 className="text-5xl font-bold mb-8">{t('cart.title')}</h1>
                    <p className="text-xl mb-6 text-gray-500">{t('cart.empty')}</p>
                    <Button onClick={() => navigate('/catalog')}>{t('cart.continueShopping')}</Button>
                </div>
            ) : (
                <div className="flex gap-8">

                    {/* Colonne gauche */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-5xl font-bold mb-8">{t('cart.title')}</h1>

                        {/* Bannière indisponibilité */}
                        {hasUnavailableItems && (
                            <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500">
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0">
                                    <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 6.5a.75.75 0 110-1.5.75.75 0 010 1.5z" fill="currentColor" />
                                </svg>
                                {t('cart.unavailableWarning')}
                            </div>
                        )}

                        {items.map(item => (
                            <CartItemCard
                                key={item.id}
                                item={item}
                                onRemove={removeFromCart}
                                onUpdateQuantity={updateQuantity}
                            />
                        ))}
                    </div>

                    {/* Colonne droite */}
                    <div className="w-64 shrink-0">
                        <div className="mb-6">
                            <p className="text-lg font-semibold text-right">
                                {t('cart.totalProducts', { count: items.length })}
                            </p>
                            <div className="text-right mt-1">
                                <button
                                    onClick={() => navigate('/catalog')}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {t('cart.continueShopping')}
                                </button>
                            </div>
                        </div>

                        <div className="cart-summary bg-black text-white p-6 rounded-xl sticky top-8">
                            <p className="text-sm text-gray-400 mb-1">{t('cart.total')}</p>
                            <div className="text-4xl font-bold mb-6">
                                {formatCurrency(totalAmount)}
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base rounded-full disabled:opacity-50 disabled:cursor-not-allowed"

                                onClick={() => navigate('/checkout')}
                                disabled={hasUnavailableItems}
                            >
                                {t('cart.checkoutBtn')}
                            </Button>
                        </div>
                    </div>

                </div>
            )}
        </div>
        </div>
        </>
    );
}
