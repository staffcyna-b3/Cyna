import { LogoutButton } from '../../components/ui/logoutButton';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.full_name} !
        </h1>
        <p className="text-gray-600 mb-8">{user?.email}</p>

        <div className="flex gap-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};