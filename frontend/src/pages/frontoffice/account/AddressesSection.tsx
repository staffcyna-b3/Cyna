import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  AddressApiError,
} from '@/services/addressService';
import type { Address } from '@/types/interfaces/address/Address';
import type { Props } from '@/types/interfaces/account/AddressesSectionProps';
import { AddressCard } from './AddressCard';
import { AddressDialog } from './AddressDialog';
import { useState } from 'react';

export function AddressesSection({ token, addresses, onAddressesChange }: Props) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);

  const reload = async () => {
    try {
      const updated = await getAddresses(token);
      onAddressesChange(updated);
    } catch (err) {
      if (err instanceof AddressApiError && err.status === 401) {
        toast.error(t('sessionExpired'));
      } else {
        toast.error(t('errorOccurred'));
      }
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(token, address.id);
      onAddressesChange(
        addresses.map((a) =>
          a.type === address.type ? { ...a, is_default: a.id === address.id } : a
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(token, id);
      toast.success(t('account.addressDeleted'));
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error'));
    }
  };

  const handleSaved = async (saved: Address) => {
    // Optimistic update while re-fetch runs.
    onAddressesChange(
      addresses.find((a) => a.id === saved.id)
        ? addresses.map((a) => (a.id === saved.id ? saved : a))
        : [...addresses, saved]
    );
    await reload();
  };

  const types = [...new Set(addresses.map((a) => a.type))] as Array<'billing' | 'shipping'>;
  const byType = types.reduce<Record<string, Address[]>>((acc, type) => {
    acc[type] = addresses.filter((a) => a.type === type);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('account.addressesTitle')}</h2>
        <Button
          onClick={() => {
            setEditTarget(null);
            setDialogOpen(true);
          }}
        >
          {t('account.addAddress')}
        </Button>
      </div>

      {Object.entries(byType).map(([type, list]) => (
        <div key={type} className="flex flex-col gap-3">
          <h3 className="font-medium text-muted-foreground">{t(`account.${type}`)}</h3>
          {list.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              onSetDefault={handleSetDefault}
              onEdit={(addr) => {
                setEditTarget(addr);
                setDialogOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ))}

      {addresses.length === 0 && (
        <p className="text-muted-foreground text-sm">{t('account.noAddresses')}</p>
      )}

      <AddressDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        token={token}
        editTarget={editTarget}
        onSaved={handleSaved}
      />
    </div>
  );
}
