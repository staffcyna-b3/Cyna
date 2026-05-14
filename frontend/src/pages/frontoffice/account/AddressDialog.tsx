import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddressApi } from '@/api/AddressApi';
import type { CreateAddressPayload } from '@/types/interfaces/address/CreateAddressPayload';
import type { Props } from '@/types/interfaces/account/AddressDialogProps';

const empty: CreateAddressPayload = {
  type: 'billing',
  address_line1: '',
  address_line2: '',
  city: '',
  postcode: '',
  country: '',
};

export function AddressDialog({ open, onClose, editTarget, onSaved }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CreateAddressPayload>(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTarget) {
      setForm({
        type: editTarget.type,
        address_line1: editTarget.address_line1,
        address_line2: editTarget.address_line2 ?? '',
        city: editTarget.city,
        postcode: editTarget.postcode,
        country: editTarget.country,
      });
    } else {
      setForm(empty);
    }
  }, [editTarget, open]);

  const set = (field: keyof CreateAddressPayload, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: CreateAddressPayload = {
        ...form,
        address_line2: form.address_line2 || null,
      };
      let saved;
      const api = AddressApi.getInstance();
      if (editTarget) {
        saved = await api.updateAddress(editTarget.id, payload);
        toast.success(t('account.addressUpdated'));
      } else {
        saved = await api.createAddress(payload);
        toast.success(t('account.addressSaved'));
      }
      await onSaved(saved);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editTarget ? t('account.editAddress') : t('account.addAddress')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>{t('account.addressType')}</Label>
            <Select
              value={form.type}
              onValueChange={(v) => set('type', v)}
              disabled={!!editTarget}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="billing">{t('account.billing')}</SelectItem>
                <SelectItem value="shipping">{t('account.shipping')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="address_line1">{t('address')}</Label>
            <Input
              id="address_line1"
              value={form.address_line1}
              onChange={(e) => set('address_line1', e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="address_line2">{t('account.addressLine2')}</Label>
            <Input
              id="address_line2"
              value={form.address_line2 ?? ''}
              onChange={(e) => set('address_line2', e.target.value)}
              placeholder={t('account.addressLine2Placeholder')}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="city">{t('city')}</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="postcode">{t('postcode')}</Label>
            <Input
              id="postcode"
              value={form.postcode}
              onChange={(e) => set('postcode', e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="country">{t('country')}</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('loading') : t('account.saveAddress')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
