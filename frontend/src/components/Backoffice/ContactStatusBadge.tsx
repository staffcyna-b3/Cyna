import { t } from 'i18next';
import { Badge } from '@/components/ui/badge';

interface ContactStatusBadgeProps {
  status: 'new' | 'processed';
}

export function ContactStatusBadge({ status }: ContactStatusBadgeProps) {
  return (
    <Badge variant={status === 'new' ? 'default' : 'secondary'}>
      {status === 'new' ? t('contact.statusNew') : t('contact.statusProcessed')}
    </Badge>
  );
}
