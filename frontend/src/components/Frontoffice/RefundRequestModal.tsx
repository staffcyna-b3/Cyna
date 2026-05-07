import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  loading: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

export function RefundRequestModal({ open, loading, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  function handleSubmit() {
    if (reason.trim()) onSubmit(reason.trim());
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setReason('');
      onCancel();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('subscriptions.refundRequestTitle')}</DialogTitle>
          <DialogDescription>{t('subscriptions.refundRequestInfo')}</DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={t('subscriptions.refundReasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          disabled={loading}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || reason.trim().length === 0}>
            {loading ? t('loading') : t('subscriptions.sendRequest')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
