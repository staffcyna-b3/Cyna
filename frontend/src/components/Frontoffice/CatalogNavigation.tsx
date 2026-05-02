import { useState, JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Category } from '@/types/interfaces/category/Category';
import { CategoryType } from '@/types/enums/category/CategoryType';
import { CatalogSection } from '@/types/enums/navigation/CatalogSection';
import { CatalogNavigationProps } from '@/types/interfaces/catalog/CatalogNavigationProps';

const CatalogNavigation = ({
    categories,
    activeCategory,
    onCategoryClick,
    className,
}: CatalogNavigationProps): JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const getCategoryIdentifier = (category: Category): string => category.id;
    const services = categories.filter((c) => (c.type || '').toLowerCase() === CategoryType.SERVICE);
    const products = categories.filter((c) => (c.type || '').toLowerCase() === CategoryType.PRODUCT);
    const [openSection, setOpenSection] = useState<CatalogSection | null>(null);

    const toggleSection = (section: CatalogSection) => {
        setOpenSection((s) => (s === section ? null : section));
    };

    const isServiceActive = services.some((c) => getCategoryIdentifier(c) === activeCategory);
    const isProductActive = products.some((c) => getCategoryIdentifier(c) === activeCategory);
    const headerClass = 'text-xs uppercase tracking-wider mb-0.5';

    return (
        <nav
            aria-label="Product categories"
            className={className ?? "fixed bottom-5 left-1/2 z-40 w-auto -translate-x-1/2 transform"}
        >
            <div className="relative mx-auto flex w-full max-w-4xl items-center justify-between gap-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3 backdrop-blur-xs">
                {[
                    {
                        id: 'home',
                        header: t('home'),
                        renderHeader: () => (
                            <button
                                type="button"
                                onClick={() => {
                                    navigate('/');
                                    setOpenSection(null);
                                    onCategoryClick(null);
                                }}
                                className={`${headerClass} text-[#9aa0c7]`}
                            >
                                {t('home')}
                            </button>
                        ),
                    },
                    {
                        id: 'services',
                        header: t('services'),
                        items: services,
                        isActive: isServiceActive,
                        keyName: CatalogSection.SERVICES,
                    },
                    {
                        id: 'products',
                        header: t('products'),
                        items: products,
                        isActive: isProductActive,
                        keyName: CatalogSection.PRODUCTS,
                    },
                ].map((section) => (
                    <div key={section.id} className={`relative flex flex-col items-center ${section.id === 'home' ? 'flex-row gap-4' : ''}`}>
                        <div>
                            {section.renderHeader ? (
                                section.renderHeader()
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        toggleSection(section.keyName as CatalogSection);
                                    }}
                                    className={`${headerClass} ${section.isActive || openSection === (section.keyName as CatalogSection) ? 'text-[#7b61ff]' : 'text-[#9aa0c7]'}`}
                                >
                                    {section.header}
                                </button>
                            )}
                        </div>

                        {section.items ? (
                            <>
                                {openSection === (section.keyName as CatalogSection) && (
                                    <div className="absolute bottom-full left-1/2 mb-3 w-56 -translate-x-1/2 transform rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0b0b12] px-3 py-3 text-black shadow-xl">
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
                                                        onClick={() => {
                                                            navigate(`/catalog?categoryId=${encodeURIComponent(categoryId)}`);
                                                            onCategoryClick(categoryId);
                                                            setOpenSection(null);
                                                        }}
                                                        className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-all duration-150 ${isActive ? 'bg-gradient-to-r from-[#5a3bff] to-[#3b2b8f] text-white' : 'text-[#d0d6ff] hover:text-white'}`}
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
