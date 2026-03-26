import { useState, JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Category } from '../types/interfaces/category/Category';
import { CategoryType } from '../types/enums/category/CategoryType';
import { CatalogSection } from '@/types/enums/navigation/CatalogSection';
import { CatalogNavigationProps } from '@/types/interfaces/catalog/CatalogNavigationProps';

const CatalogNavigation = ({
    categories,
    activeCategory,
    onCategoryClick,
}: CatalogNavigationProps): JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const getCategoryIdentifier = (category: Category): string => category.id;


    // Group categories by type
    const services = categories.filter((c) => (c.type || '').toLowerCase() === CategoryType.SERVICE);
    const products = categories.filter((c) => (c.type || '').toLowerCase() === CategoryType.PRODUCT);

    const [openSection, setOpenSection] = useState<CatalogSection | null>(null);

    const toggleSection = (section: CatalogSection) => {
        setOpenSection((s) => (s === section ? null : section));
    };

    const isServiceActive = services.some((c) => getCategoryIdentifier(c) === activeCategory);
    const isProductActive = products.some((c) => getCategoryIdentifier(c) === activeCategory);

    const location = useLocation();
    const isCatalogPath = location.pathname === '/catalog';

    // central classes
    const headerClass = 'text-xs uppercase tracking-wider mb-0.5';
    const sectionBtnClass = 'px-4 py-2 rounded-full text-sm transition-all duration-200';

    return (
        <nav
            aria-label="Product categories"
            className="fixed left-1/2 transform -translate-x-1/2 bottom-5 z-40 w-auto"
            style={{
                WebkitBackdropFilter: 'blur(8px)',
                backdropFilter: 'blur(8px)'
            }}
        >
            <div className="flex items-center justify-between gap-6 px-4 py-3 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] shadow-lg relative max-w-4xl w-full mx-auto">
                {[
                    {
                        id: 'home',
                        header: t('home'),
                        renderHeader: () => (
                            <button
                                type="button"
                                onClick={() => { navigate('/'); setOpenSection(null); onCategoryClick(null); }}
                                className={`${headerClass} text-[#9aa0c7]`}
                            >
                                {t('home')}
                            </button>
                        ),
                        renderMain: () => (
                            <button
                                type="button"
                                onClick={() => { navigate('/catalog'); setOpenSection(null); onCategoryClick(null); }}
                                className={`${sectionBtnClass} ${activeCategory === null && isCatalogPath ? 'bg-gradient-to-r from-[#5a3bff] to-[#3b2b8f] text-white' : 'text-[#d0d6ff] hover:text-white'}`}
                            >
                                {t('allProducts')}
                            </button>
                        ),
                    },
                    {
                        id: 'services',
                        header: t('services'),
                        items: services,
                        isActive: isServiceActive,
                        keyName: CatalogSection.SERVICES
                    },
                    {
                        id: 'products',
                        header: t('products'),
                        items: products,
                        isActive: isProductActive,
                        keyName: CatalogSection.PRODUCTS
                    }
                ].map((section) => (
                    <div key={section.id} className={`flex flex-col items-center relative ${section.id === 'home' ? 'flex-row gap-4' : ''}`}>
                        <div>
                            {section.renderHeader ? (
                                section.renderHeader()
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { toggleSection(section.keyName as CatalogSection); }}
                                    className={`${headerClass} ${section.isActive || openSection === (section.keyName as CatalogSection) ? 'text-[#7b61ff]' : 'text-[#9aa0c7]'}`}
                                >
                                    {section.header}
                                </button>
                            )}
                        </div>

                        {/* main (for home) or toggle button for groups */}
                        {section.renderMain ? (
                            <div>{section.renderMain()}</div>
                        ) : section.items ? (
                            <>
                                {openSection === (section.keyName as CatalogSection) && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 py-3 px-3 rounded-lg bg-[#0b0b12] text-black border border-[rgba(255,255,255,0.06)] shadow-xl">
                                        <div className="flex flex-col gap-2">
                                            {section.items.length === 0 && (
                                                <div className="text-sm text-[#7b7f99]">{t('noCategory')}</div>
                                            )}
                                            {section.items.map((category: Category) => {
                                                const categoryId: string = getCategoryIdentifier(category);
                                                const isActive: boolean = activeCategory === categoryId;

                                                return (
                                                    <button
                                                        key={category.id}
                                                        type="button"
                                                        onClick={() => { navigate(`/catalog?category=${encodeURIComponent(categoryId)}`); onCategoryClick(categoryId); setOpenSection(null); }}
                                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${isActive ? 'bg-gradient-to-r from-[#5a3bff] to-[#3b2b8f] text-white' : 'text-[#d0d6ff] hover:text-white'}`}
                                                    >
                                                        {category.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default CatalogNavigation;
