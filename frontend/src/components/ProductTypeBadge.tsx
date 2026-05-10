import { useTranslation } from 'react-i18next';
import { ProductTypeBadgeProps } from '@/types/enums/product/ProductTypeBadgeProps';

export const ProductTypeBadge = ({ isService, className }: ProductTypeBadgeProps) => {
    const { t } = useTranslation();

    return (
        <span className={"bg-gradient-to-r from-[#0d0a16] to-[#1b1630] text-xs font-semibold rounded-md text-white" + (className ? ` ${className}` : '')}>
            {t(isService ? 'service' : 'product')}
        </span>
    );
};

export default ProductTypeBadge;
