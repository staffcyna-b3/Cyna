import { useTranslation } from 'react-i18next';
import { FooterLink } from './FooterLink';
import { FooterLinkConstants } from './constants/links.constants';
import { SOCIALS } from './constants/socials.constants';
import { SOLUTIONS } from './constants/solutions.constants';

export default function CatalogFooter() {
    const { t } = useTranslation();

    return (
        <footer className='text-white'>
            <div className='bg-black px-6 py-6'>
                <div className='max-w-7xl mx-auto'>
                    <p className='text-xl font-bold'>{t('Cyna')}</p>
                    <p className='text-sm mt-2' style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {t('footer.description')}
                    </p>
                </div>
            </div>

            <div className='bg-[#111111] px-6 pt-8 pb-10'>
                <div className='max-w-7xl mx-auto'>
                    <div className='flex justify-between items-start'>
                        <div className='flex gap-4 pt-1'>
                            {SOCIALS.map(({ svg, to, label }) => (
                                <FooterLink key={label} to={to}>
                                    <span aria-label={label}>{svg}</span>
                                </FooterLink>
                            ))}
                        </div>

                        <div className='flex gap-16'>
                            <div>
                                <p className='font-semibold mb-4 text-sm'>{t('footer.solutions.title')}</p>
                                <ul className='flex flex-col gap-3'>
                                    {SOLUTIONS.map((s) => (
                                        <li key={'labelKey' in s ? s.labelKey : s.label}>
                                            <FooterLink to={s.to}>
                                                {'labelKey' in s ? t(s.labelKey) : s.label}
                                            </FooterLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className='font-semibold mb-4 text-sm'>{t('footer.legal.title')}</p>
                                <ul className='flex flex-col gap-3'>
                                    {FooterLinkConstants.map(({ key, to }) => (
                                        <li key={key}>
                                            <FooterLink to={to}>{t(key)}</FooterLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p className='mt-10 text-center text-sm' style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {t('footer.copyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
