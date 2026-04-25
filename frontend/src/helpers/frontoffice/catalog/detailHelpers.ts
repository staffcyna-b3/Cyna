import byteaToImage from '@/utils/byteaToImage';
import placeholder from '@/assets/pictures/placeholder.svg';
import { ProductPictureResponse } from '@/types/interfaces/catalog/ProductPictureResponse';

export function sortProductImages(
    images: ProductPictureResponse[] | undefined
): ProductPictureResponse[] {
    return [...(images ?? [])].sort((a, b) => {
        if (a.isMain === b.isMain) return 0;
        return a.isMain ? -1 : 1;
    });
}

export function getProductImageSrc(image?: ProductPictureResponse | null): string {
    if (!image) return placeholder;

    if (image.base64) {
        const sanitizedBase64 = image.base64.trim().replace(/\s+/g, '');
        let mimeType = 'image/jpeg';

        if (sanitizedBase64.startsWith('iVBOR')) {
            mimeType = 'image/png';
        } else if (sanitizedBase64.startsWith('Qk')) {
            mimeType = 'image/bmp';
        }

        return byteaToImage(sanitizedBase64, mimeType);
    }

    if (image.id) return `/api/media/${image.id}`;

    return placeholder;
}

export function getServiceAbbreviation(productName: string): string {
    const abbreviationMatch = productName.match(/([A-Z]+)\s*\(/);

    if (abbreviationMatch?.[1]) return abbreviationMatch[1];

    return productName.substring(0, 3).toUpperCase();
}
