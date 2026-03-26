import { useEffect, useState, JSX } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import GetCategories from '../hooks/getCategories';
import { CatalogLayoutProps } from '../types/interfaces/catalog/CatalogLayoutProps.interface';
import { Category } from '../types/interfaces/category/Category';
import CatalogNavigation from '../components/CatalogNavigation';
import CatalogProvider from '@/providers/CatalogProvider';

const CatalogLayout = ({
    children,
}: CatalogLayoutProps): JSX.Element => {
    const { data: categories, listCategories } = GetCategories();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        void listCategories();
    }, [listCategories]);

    // Sync active category with URL search params
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam: string | null = searchParams.get('category');
        setActiveCategory(categoryParam);
    }, [location]);

    const typedCategories: Category[] = categories ?? [];

    return (
        <CatalogProvider>
            <style>{`
                /* Accessibilité : forcer la couleur du texte en blanc pour garantir lisibilité */
                .catalog-layout, .catalog-layout * {
                    color: #ffffff !important;
                }
            `}</style>
            <div className='catalog-layout min-h-screen bg-fixed bg-[radial-gradient(circle_at_center,#1a0066_0%,#0f003d_30%,#060018_60%,#020008_80%,#000000_100%)]'>
                <CatalogNavigation
                    categories={typedCategories}
                    activeCategory={activeCategory}
                    onCategoryClick={setActiveCategory}
                />
                {children ?? <Outlet />}
            </div>
        </CatalogProvider>
    );
};

export default CatalogLayout;
