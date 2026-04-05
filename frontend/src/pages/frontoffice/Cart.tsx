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

    if (isLoading) return <div className="p-8 text-center">{t('loading')}</div>;

    return (
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
                    <div className="flex-1">
                        <h1 className="text-5xl font-bold mb-8">{t('cart.title')}</h1>
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
                    <div className="w-64 flex-shrink-0">
                        {/* Header droite : compteur + lien continuer */}
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

                        {/* Carte total */}
                        <div className="bg-black text-white p-6 rounded-xl sticky top-8">
                            <p className="text-sm text-gray-400 mb-1">{t('cart.total')}</p>
                            <div className="text-4xl font-bold mb-6">
                                {formatCurrency(totalAmount)}
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base rounded-full"
                                onClick={() => navigate('/checkout')}
                            >
                                {t('cart.checkoutBtn')}
                            </Button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}