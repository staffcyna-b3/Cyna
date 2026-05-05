import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FooterLinkConstants } from './constants/links.constants';

export default function CatalogFooter() {
    const { t } = useTranslation();

    return (
        <footer className='w-full py-6 text-center text-white/40 text-xs'>
            <p className='mb-2'>{t('footer.copyright')}</p>
            <nav className='flex flex-wrap justify-center gap-x-4 gap-y-1'>
                {FooterLinkConstants.map(({ key, to }) => (
                    <Link
                        key={key}
                        to={to}
                        className='hover:text-white/70 transition-colors duration-150'
                    >
                        {t(key)}
                    </Link>
                ))}
            </nav>
        </footer>
    );
}
