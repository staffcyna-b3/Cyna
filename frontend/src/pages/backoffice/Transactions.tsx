import { useTranslation } from 'react-i18next';
import { BackOfficeModuleStubPage } from '@/components/Backoffice/shared/BackOfficeModuleStubPage';

export default function Transactions() {
    const { t } = useTranslation();

    return (
        <BackOfficeModuleStubPage
            title={t('transactions')}
            activeLabel={t('active')}
            inactiveLabel={t('inactive')}
            message={t('backoffice.transactionsComingSoon')}
        />
    );
}
