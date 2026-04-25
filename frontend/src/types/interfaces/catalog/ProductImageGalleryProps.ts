import { TFunction } from 'i18next';
import { ProductPictureResponse } from './ProductPictureResponse';

export interface ProductImageGalleryProps {
    productName: string;
    images: ProductPictureResponse[] | undefined;
    t: TFunction;
}
