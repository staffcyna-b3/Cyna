import { ShoppingCart } from 'lucide-react';
import React, { useCallback } from 'react';
import { Button } from './button';

export default function AddToCartButton({ disabled }: { disabled?: boolean }) {
    const handleClick = useCallback(() => {
        // TODO: ajouter au panier
        alert('TODO: ajouter au panier');
    }, []);

    return (
        <Button
            variant="default"
            onClick={handleClick}
            disabled={!!disabled}
            className={
                'p-2 rounded-md ' +
                (disabled
                    ? 'text-[#777] bg-transparent'
                    : 'text-white bg-transparent')
            }
        >
            <ShoppingCart className="w-4 h-4" />
        </Button>
    );
}
