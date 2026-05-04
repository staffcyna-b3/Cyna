import { t } from "i18next"
import { Button } from "../ui/button"
import { LucideTrash } from "lucide-react"
import { formatCurrency } from "@/utils/currencyFormatter"
import { CartItem as CheckoutCartItem } from "@/types/interfaces/cart/CartItem"

interface CartItemProps {
  item: CheckoutCartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

const getPeriodLabel = (months: number): string => {
  if (months === 12) return 'an';
  return `${months} mois`;
};

export const CartItem = ({ item, onQuantityChange, onRemove }: CartItemProps) => {
  const periodLabel = item.period ? getPeriodLabel(item.period) : '';
  const effectivePrice = item.discountedUnitPrice ?? item.unitPrice;
  const hasDiscount = item.discountedUnitPrice !== undefined;

  const priceDisplay = item.isService && item.period ? (
    <span className="flex items-baseline gap-1">
      {hasDiscount && (
        <span className="line-through text-gray-400 text-sm">
          {formatCurrency(item.unitPrice * item.period)}
        </span>
      )}
      <span className={hasDiscount ? 'text-red-600 font-semibold' : ''}>
        {formatCurrency(effectivePrice * item.period)}
      </span>
      <span className="font-normal text-gray-500 text-sm">{t("for a total period of")} {periodLabel}</span>
    </span>
  ) : (
    <span className="flex items-baseline gap-1">
      {hasDiscount && (
        <span className="line-through text-gray-400 text-sm">{formatCurrency(item.unitPrice)}</span>
      )}
      <span className={hasDiscount ? 'text-red-600 font-semibold' : ''}>{formatCurrency(effectivePrice)}</span>
    </span>
  );

  const effectiveSubtotal = item.period
    ? effectivePrice * item.quantity * item.period
    : effectivePrice * item.quantity;

  const totalDisplay = item.isService && item.period
    ? <>{formatCurrency(effectivePrice * item.quantity)} <span className="text-gray-400 text-xs">{t("per month")}</span></>
    : <>{formatCurrency(effectiveSubtotal)}</>;

  return (
    <div className="flex bg-muted/80 p-4 rounded-lg gap-4">
      <div className="flex flex-col gap-2">
        <p>{item.name}</p>
        <p>{priceDisplay}</p>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1 px-1.5 bg-gray-200 rounded-lg w-fit justify-center">
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}>-</Button>
            <p>{item.quantity}</p>
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</Button>
          </div>
          <Button variant="ghost" onClick={() => onRemove(item.id)}><LucideTrash /></Button>
        </div>
        <p>{t("total")} {totalDisplay}</p>
      </div>
    </div>
  )
}
