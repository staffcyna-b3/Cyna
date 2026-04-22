import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';

type RefundSheetProps = {
  open: boolean;
  title: string;
  amountLabel: string;
  reasonLabel: string;
  paymentIntentLabel: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundReason?: string | null;
  refundPaymentIntent?: string;
  refundCreatedAt?: number;
  onOpenChange: (open: boolean) => void;
};

export function RefundSheet({
  open,
  title,
  amountLabel,
  reasonLabel,
  paymentIntentLabel,
  refundId,
  refundAmount,
  refundStatus,
  refundReason,
  refundPaymentIntent,
  refundCreatedAt,
  onOpenChange,
}: RefundSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
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
                ? (refundAmount / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
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

          {refundPaymentIntent && (
            <div className="flex flex-col gap-1.5">
              <Label>{paymentIntentLabel}</Label>
              <span className="text-xs text-muted-foreground font-mono">{refundPaymentIntent}</span>
            </div>
          )}

          {refundCreatedAt !== undefined && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.date')}</Label>
              <span className="text-sm text-muted-foreground">
                {new Date(refundCreatedAt * 1000).toLocaleString('fr-FR')}
              </span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
