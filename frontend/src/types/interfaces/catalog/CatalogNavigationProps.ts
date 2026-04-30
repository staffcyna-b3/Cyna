import { Category } from "../category/Category";

export interface CatalogNavigationProps {
    categories: Category[];
    activeCategory: string | null;
    onCategoryClick: (categoryId: string | null) => void;
}