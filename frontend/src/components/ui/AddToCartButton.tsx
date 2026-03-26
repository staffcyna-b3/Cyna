import { ShoppingCart } from 'lucide-react';
import React, { useCallback } from 'react';
import { Button } from './button';
import { addToCart } from '@/lib/cart';
import { Period } from '@/types/Period';

export default function AddToCartButton({
    disabled,
    productId,
    text,
    quantity,
    period,
    onClick,
    skipAddToCart,
}: {
    disabled?: boolean;
    productId: string;
    text?: string;
    quantity?: number;
    period?: Period;
    onClick?: () => void;
    skipAddToCart?: boolean;
}) {
    const handleClickInternal = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            // prevent parent Link navigation
            e.stopPropagation();
            if (!skipAddToCart) {
                try {
                    addToCart(productId, { quantity, period });
                } catch  {
                    // ignore
                }
            }
            if (onClick) onClick();
        },
        [productId, quantity, period, onClick, skipAddToCart]
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
