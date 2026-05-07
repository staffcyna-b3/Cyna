import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  periodEndDate: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReactivateSubscriptionModal({ open, periodEndDate, loading, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('subscriptions.reactivateTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('subscriptions.reactivateDescription', { date: periodEndDate })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={loading}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? t('loading') : t('subscriptions.confirmReactivate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
