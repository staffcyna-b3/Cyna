import { useEffect, useState, JSX } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import { CatalogLayoutProps } from '../types/interfaces/catalog/CatalogLayoutProps.interface';
import { Category } from '../types/interfaces/category/Category';
import CatalogNavigation from '@/components/Frontoffice/CatalogNavigation';
import CatalogProvider from '@/providers/CatalogProvider';
import CatalogFooter from '@/components/Frontoffice/catalog/footer/CatalogFooter';

const CatalogLayout = ({
    children,
}: CatalogLayoutProps): JSX.Element => {
    const { data: categories, listCategories } = useCategories();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        void listCategories();
    }, [listCategories]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam: string | null = searchParams.get('categoryId') ?? searchParams.get('category');
        setActiveCategory(categoryParam);
    }, [location]);

    const typedCategories: Category[] = categories ?? [];

    return (
        <CatalogProvider>
            <div className='catalog-layout min-h-screen bg-fixed bg-[radial-gradient(circle_at_center,#1a0066_0%,#0f003d_30%,#060018_60%,#020008_80%,#000000_100%)]'>
                {location.pathname !== '/' && (
                    <CatalogNavigation
                        categories={typedCategories}
                        activeCategory={activeCategory}
                        onCategoryClick={setActiveCategory}
                    />
                )}
                {children ?? <Outlet />}
                <CatalogFooter />
            </div>
        </CatalogProvider>
    );
};

export default CatalogLayout;
