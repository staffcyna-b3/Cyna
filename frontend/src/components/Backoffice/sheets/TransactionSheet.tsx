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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type TransactionSheetProps = {
  open: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: number;
  title: string;
  amountLabel: string;
  statusLabel: string;
  descriptionLabel: string;
  dateLabel: string;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmRefund: (paymentIntentId: string, amount: number | undefined, reason: string) => void;
};

export function TransactionSheet({
  open,
  transactionId,
  amount,
  currency,
  status,
  description,
  createdAt,
  title,
  amountLabel,
  statusLabel,
  descriptionLabel,
  dateLabel,
  submitting,
  onOpenChange,
  onConfirmRefund,
}: TransactionSheetProps) {
  const { t } = useTranslation();
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
  const [refundReason, setRefundReason] = useState('');

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setShowRefundForm(false);
      setRefundAmount(undefined);
      setRefundReason('');
    }
    onOpenChange(value);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{transactionId}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <Label>{amountLabel}</Label>
            <span className="text-sm">
              {(amount / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: currency.toUpperCase(),
              })}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{statusLabel}</Label>
            <span className="text-sm">{status}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{descriptionLabel}</Label>
            <span className="text-sm text-muted-foreground">{description ?? '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{dateLabel}</Label>
            <span className="text-sm text-muted-foreground">
              {new Date(createdAt * 1000).toLocaleString('fr-FR')}
            </span>
          </div>

          {showRefundForm && (
            <>
              <hr className="border-border" />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="refund-amount">{t('admin.amount')}</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  placeholder={t('admin.refundAmountPlaceholder')}
                  value={refundAmount ?? ''}
                  onChange={(e) => setRefundAmount(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="refund-reason">{t('admin.reason')}</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
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
          )}
        </div>

        <SheetFooter>
          {showRefundForm ? (
            <>
              <Button
                variant="destructive"
                className="w-full"
                disabled={submitting}
                onClick={() => onConfirmRefund(transactionId, refundAmount, refundReason)}
              >
                {t('admin.confirmRefund')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowRefundForm(false);
                  setRefundAmount(undefined);
                  setRefundReason('');
                }}
              >
                {t('cancel')}
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowRefundForm(true)}
            >
              {t('admin.initiateRefund')}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
