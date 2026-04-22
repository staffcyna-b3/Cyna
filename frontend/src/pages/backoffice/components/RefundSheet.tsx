import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';

type RefundSheetProps = {
  open: boolean;
  mode: 'create' | 'view';
  paymentIntentId?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundReason?: string | null;
  refundCreatedAt?: number;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  amountLabel: string;
  reasonLabel: string;
  paymentIntentLabel: string;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onAmountChange?: (value: number | undefined) => void;
  onReasonChange?: (value: string) => void;
  onConfirm?: () => void;
  amount?: number;
  reason?: string;
};

export function RefundSheet({
  open,
  mode,
  paymentIntentId,
  refundId,
  refundAmount,
  refundStatus,
  refundReason,
  refundCreatedAt,
  title,
  confirmLabel,
  cancelLabel,
  amountLabel,
  reasonLabel,
  paymentIntentLabel,
  submitting,
  onOpenChange,
  onAmountChange,
  onReasonChange,
  onConfirm,
  amount,
  reason,
}: RefundSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="flex flex-row items-center justify-between border-b p-4">
          <SheetTitle>{title}</SheetTitle>
          {mode === 'create' && (
            <Button onClick={onConfirm} disabled={submitting} size="sm">
              {confirmLabel}
            </Button>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          {mode === 'create' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="refund-payment-intent">{paymentIntentLabel}</Label>
                <Input
                  id="refund-payment-intent"
                  value={paymentIntentId ?? ''}
                  readOnly
                  disabled
                  className="opacity-60 font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="refund-amount">{amountLabel}</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  placeholder={t('admin.refundAmountPlaceholder')}
                  value={amount ?? ''}
                  onChange={(e) =>
                    onAmountChange?.(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="refund-reason">{reasonLabel}</Label>
                <Select value={reason ?? ''} onValueChange={onReasonChange}>
                  <SelectTrigger id="refund-reason" className="w-full">
                    <SelectValue placeholder={t('admin.refundSelectReason')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested_by_customer">{t('admin.refundReasonCustomer')}</SelectItem>
                    <SelectItem value="duplicate">{t('admin.refundReasonDuplicate')}</SelectItem>
                    <SelectItem value="fraudulent">{t('admin.refundReasonFraudulent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              {refundId && (
                <div className="flex flex-col gap-1.5">
                  <Label>{t('admin.refundId')}</Label>
                  <span className="text-xs text-muted-foreground font-mono">{refundId}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label>{amountLabel}</Label>
                <span className="text-sm">
                  {refundAmount !== undefined
                    ? (refundAmount / 100).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })
                    : '—'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{t('admin.status')}</Label>
                <span className="text-sm">{refundStatus ?? '—'}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{reasonLabel}</Label>
                <span className="text-sm text-muted-foreground">{refundReason ?? '—'}</span>
              </div>

              {refundCreatedAt !== undefined && (
                <div className="flex flex-col gap-1.5">
                  <Label>{t('admin.date')}</Label>
                  <span className="text-sm text-muted-foreground">
                    {new Date(refundCreatedAt * 1000).toLocaleString('fr-FR')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {mode === 'create' && (
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              {cancelLabel}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
