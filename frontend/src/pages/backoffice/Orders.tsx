import { useTranslation } from 'react-i18next';
import { BackOfficeModuleStubPage } from '@/components/Backoffice/shared/BackOfficeModuleStubPage';

export default function Orders() {
    const { t } = useTranslation();

    return (
        <BackOfficeModuleStubPage
            title={t('orders')}
            activeLabel={t('active')}
            inactiveLabel={t('inactive')}
            message={t('backoffice.ordersComingSoon')}
        />
    );
}
