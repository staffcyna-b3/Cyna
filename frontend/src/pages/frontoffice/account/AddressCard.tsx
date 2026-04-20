import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Address } from '@/services/addressService';

interface Props {
  address: Address;
  onSetDefault: (address: Address) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}

export function AddressCard({ address, onSetDefault, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 text-sm">
          <span>{address.address_line1}</span>
          {address.address_line2 && <span>{address.address_line2}</span>}
          <span>{address.city}, {address.postcode}</span>
          <span>{address.country}</span>
        </div>
        {address.is_default && (
          <Badge variant="default">{t('account.defaultBadge')}</Badge>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {!address.is_default && (
          <Button variant="outline" size="sm" onClick={() => onSetDefault(address)}>
            {t('account.setDefault')}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          {t('account.editAddress')}
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          {t('account.deleteAddress')}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('account.deleteAddress')}</DialogTitle>
            <DialogDescription>{t('account.confirmDelete')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onDelete(address.id);
              }}
            >
              {t('account.deleteAddress')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
