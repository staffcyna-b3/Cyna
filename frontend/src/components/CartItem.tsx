import { t } from "i18next"
import { Button } from "./ui/button"
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
  const periodTotal = item.period ? item.unitPrice * item.period : item.unitPrice;

  // Texte du prix principal
  const priceDisplay = item.isService && item.period
    ? <>{formatCurrency(periodTotal)} <span className="font-normal text-gray-500 text-sm">/ {periodLabel}</span></>
    : <>{formatCurrency(item.unitPrice)}</>;

  // Texte du sous-total
  const totalDisplay = item.isService && item.period
    ? <>{formatCurrency(item.unitPrice * item.quantity * item.period)} <span className="text-gray-400 text-xs"></span></>
    : <>{formatCurrency(item.subtotal)}</>;

  return (
    <div className="flex bg-muted/80 p-4 rounded-lg gap-4">
      <div className="flex flex-col gap-2">
        <p>{item.name}</p>
        <p>{t("currency")}{priceDisplay}</p>
        <div className="flex gap-2 items-center">
          {/* // TODO: replace gray */}
          <div className="flex items-center gap-1 px-1.5 bg-gray-200 rounded-lg w-fit justify-center">
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}>-</Button>
            <p>{item.quantity}</p>
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</Button>
          </div>
          <Button variant="ghost" onClick={() => onRemove(item.id)}><LucideTrash /></Button>
        </div>
        <p>{t("total")} {t("currency")}{totalDisplay}</p>
      </div>
    </div>
  )
}