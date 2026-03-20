import { t } from "i18next"
import { Button } from "./ui/button"
import type { CartItem as CheckoutCartItem } from "@/types/interfaces/Checkout/CartItem"
import { LucideTrash } from "lucide-react"

interface CartItemProps {
  item: CheckoutCartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export const CartItem = ({ item, onQuantityChange, onRemove }: CartItemProps) => {
  return (
    <div className="flex bg-muted/30 p-4 rounded-lg gap-4">
      <div className="flex flex-col gap-2">
        <p>{item.name}</p>
        <p>{t("currency")}{item.unitPrice.toFixed(2)}</p>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1 px-1.5 bg-muted rounded-lg w-fit justify-center">
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}>-</Button>
            <p>{item.quantity}</p>
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</Button>
          </div>
          <Button variant="ghost" onClick={() => onRemove(item.id)}><LucideTrash /></Button>
        </div>
        <p>{t("total")} {t("currency")}{(item.unitPrice * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  )
}