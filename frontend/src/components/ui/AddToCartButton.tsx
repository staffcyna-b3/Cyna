import { ShoppingCart } from 'lucide-react';
import { useCallback } from 'react';
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
}: {
    disabled?: boolean;
    productId: string;
    text?: string;
    quantity?: number;
    period?: Period;
    onClick?: () => void;
}) {
    const handleClick = useCallback(() => {
        addToCart(productId, { quantity, period });
    }, [productId, quantity, period]);

    return (
        <Button
            variant="cyna"
            onClick={onClick ?? handleClick}
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
