import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type OrderEditorSheetProps = {
  open: boolean;
  orderId: string;
  userId: string;
  status: string;
  totalAmount: number;
  stripePaymentIntentId: string | null;
  createdAt: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  title: string;
  statusLabel: string;
  itemsLabel: string;
  totalLabel: string;
  onOpenChange: (open: boolean) => void;
};

export function OrderEditorSheet({
  open,
  orderId,
  userId,
  status,
  totalAmount,
  stripePaymentIntentId,
  createdAt,
  items,
  title,
  statusLabel,
  itemsLabel,
  totalLabel,
  onOpenChange,
}: OrderEditorSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{orderId}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-userid">User ID</Label>
            <Input id="order-userid" value={userId} readOnly disabled className="opacity-60 font-mono text-xs" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-status">{statusLabel}</Label>
            <Input id="order-status" value={status} readOnly disabled className="opacity-60" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Date de création</Label>
            <span className="text-sm text-muted-foreground">
              {new Date(createdAt).toLocaleString('fr-FR')}
            </span>
          </div>

          {stripePaymentIntentId && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-stripe">Stripe Payment Intent</Label>
              <Input
                id="order-stripe"
                value={stripePaymentIntentId}
                readOnly
                disabled
                className="opacity-60 font-mono text-xs truncate"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>{itemsLabel}</Label>
            <div className="space-y-2 rounded-md border p-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{(item.unit_price * item.quantity).toLocaleString('fr-FR', {
                    style: 'currency', currency: 'EUR',
                  })}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-2">
                <span>{totalLabel}</span>
                <span>{totalAmount.toLocaleString('fr-FR', {
                  style: 'currency', currency: 'EUR',
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
