import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProfile, UserApiError } from '@/services/userService';
import { getAddresses, AddressApiError } from '@/services/addressService';
import type { UserProfile } from '@/types/interfaces/user/UserProfile';
import type { Address } from '@/types/interfaces/address/Address';
import { ProfileSection } from './account/ProfileSection';
import { PasswordSection } from './account/PasswordSection';
import { AddressesSection } from './account/AddressesSection';
import { OrdersSection } from './account/OrdersSection';

export default function AccountPage() {
  const { t } = useTranslation();
  const { accessToken, isLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      getProfile(accessToken),
      getAddresses(accessToken),
    ])
      .then(([p, a]) => {
        setProfile(p);
        setAddresses(a);
      })
      .catch((err) => {
        if (
          (err instanceof AddressApiError && err.status === 401) ||
          (err instanceof UserApiError && err.status === 401)
        ) {
          toast.error(t('sessionExpired'));
        } else {
          toast.error(t('errorOccurred'));
        }
      })
      .finally(() => setPageLoading(false));
  }, [accessToken, t]);

  if (!isLoading && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || pageLoading) {
    return <div className="py-20 px-8 text-center">{t('loading')}</div>;
  }

  if (!profile || !accessToken) return null;

  return (
    <div className="py-12 px-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('account.pageTitle')}</h1>
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 w-full overflow-x-auto justify-start [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <TabsTrigger value="profile" className="flex-1">{t('account.tabProfile')}</TabsTrigger>
          <TabsTrigger value="password" className="flex-1">{t('account.tabPassword')}</TabsTrigger>
          <TabsTrigger value="addresses" className="flex-1">{t('account.tabAddresses')}</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">{t('account.tabOrders')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSection
            profile={profile}
            token={accessToken}
            onUpdated={setProfile}
          />
        </TabsContent>
        <TabsContent value="password">
          <PasswordSection token={accessToken} />
        </TabsContent>
        <TabsContent value="addresses">
          <AddressesSection
            token={accessToken}
            addresses={addresses}
            onAddressesChange={setAddresses}
          />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersSection token={accessToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
