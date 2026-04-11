import { ProductStatus } from "@/types/enums/product/ProductStatus";
import { CatalogResponse } from "@/types/interfaces/catalog/CatalogResponse";

export const CanBeAddToCart = (product: CatalogResponse) => {
    if (product.isService) {
        return product.status == ProductStatus.AVAILABLE;
    }
    else {
        return product.stock > 0;
    }
};

export default CanBeAddToCart;
