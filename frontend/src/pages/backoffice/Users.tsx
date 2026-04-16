import { useTranslation } from 'react-i18next';
import { BackOfficeModuleStubPage } from '@/components/Backoffice/shared/BackOfficeModuleStubPage';

export default function Users() {
    const { t } = useTranslation();

    return (
        <BackOfficeModuleStubPage
            title={t('users')}
            activeLabel={t('active')}
            inactiveLabel={t('inactive')}
            message={t('usersPageContent')}
        />
    );
}