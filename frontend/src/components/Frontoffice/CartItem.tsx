import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import { LucideTrash } from "lucide-react"
import { formatCurrency } from "@/utils/currencyFormatter"
import { CartItem as CheckoutCartItem } from "@/types/interfaces/cart/CartItem"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DURATION_OPTIONS = [
  { months: 3, labelKey: "threeMonths" },
  { months: 6, labelKey: "sixMonths" },
  { months: 12, labelKey: "oneYear" },
] as const

interface CartItemProps {
  item: CheckoutCartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  onPeriodChange?: (itemId: string, period: number) => void
}

const getPeriodLabel = (months: number): string => {
  if (months === 12) return 'an';
  return `${months} mois`;
};

export const CartItem = ({ item, onQuantityChange, onRemove, onPeriodChange }: CartItemProps) => {
  const { t } = useTranslation()
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
      <span>{t('for a total period of')}</span>
      <Select
        value={item.period ? String(item.period) : undefined}
        onValueChange={(val) => onPeriodChange?.(item.id, Number(val))}
      >
        <SelectTrigger className="w-36 h-8 text-sm">
          <SelectValue placeholder={t("selectPeriod")} />
        </SelectTrigger>
        <SelectContent>
          {DURATION_OPTIONS.map(({ months, labelKey }) => (
            <SelectItem key={months} value={String(months)}>
              {t(labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
        <p>{t(`products.${item.name}.name`)}</p>
        <p>{priceDisplay}</p>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1 bg-gray-200 rounded-lg w-fit justify-center">
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}>-</Button>
            <p className="px-1.5">{item.quantity}</p>
            <Button variant="ghost" onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</Button>
          </div>
          <Button variant="ghost" onClick={() => onRemove(item.id)}><LucideTrash /></Button>
        </div>
        <p>{t("total")} {totalDisplay}</p>
      </div>
    </div>
  )
}
