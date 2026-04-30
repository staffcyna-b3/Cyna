import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, UserApiError } from '@/services/userService';
import type { Props } from '@/types/interfaces/account/ProfileSectionProps';

export function ProfileSection({ profile, token, onUpdated }: Props) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile(token, { full_name: fullName, email });
      onUpdated(updated);
      toast.success(t('account.profileUpdated'));
    } catch (err) {
      if (err instanceof UserApiError && err.status === 401) {
        toast.error(t('sessionExpired'));
      } else {
        toast.error(err instanceof Error ? err.message : t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <h2 className="text-xl font-semibold">{t('account.profileTitle')}</h2>
      <div className="flex flex-col gap-1">
        <Label htmlFor="full_name">{t('fullName')}</Label>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? t('loading') : t('update')}
      </Button>
    </form>
  );
}
