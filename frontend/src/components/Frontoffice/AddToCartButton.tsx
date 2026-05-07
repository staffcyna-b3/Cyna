import { ShoppingCart } from 'lucide-react';
import React, { useCallback } from 'react';
import { Button } from '../ui/button';
import { useCart } from '@/hooks/useCart';
import { Period } from '@/types/Period';

export default function AddToCartButton({
    disabled,
    productId,
    text,
    quantity,
    period,
    name,
    unitPrice,
    discountedUnitPrice,
    isService,
    stock,
    onClick,
    skipAddToCart,
}: {
    disabled?: boolean;
    productId: string;
    text?: string;
    quantity?: number;
    period?: Period;
    name?: string;
    unitPrice?: number;
    discountedUnitPrice?: number;
    isService?: boolean;
    stock?: number;
    onClick?: () => void;
    skipAddToCart?: boolean;
}) {
    const { addToCart } = useCart();

    const handleClickInternal = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (!skipAddToCart) {
                try {
                    await addToCart(productId, { quantity, period, name, unitPrice, discountedUnitPrice, isService, stock });
                } catch {
                    // ignore
                }
            }
            if (onClick) onClick();
        },
        [productId, quantity, period, name, unitPrice, discountedUnitPrice, isService, stock, onClick, skipAddToCart, addToCart]
    );

    return (
        <Button
            variant="cyna"
            onClick={handleClickInternal}
            disabled={!!disabled}
            className={'p-2 rounded-md'}
            style={{
                backgroundColor: '#372CCA',
                color: disabled ? '#777' : '#ffffff',
            }}
        >
            <ShoppingCart className="w-4 h-4" />
            {text && <span className="ml-2">{text}</span>}
        </Button>
    );
}
