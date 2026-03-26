import Product from '../models/Product';
import ProductImage from '../models/ProductImage';
import { ProductResponseDto } from '../dto/response/ProductResponse.dto';
import { CategoryResponseDto } from '../dto/response/CategoryResponse.dto';

export function mapProductToDto(product: Product): ProductResponseDto {
    return {
        id: product.id,
        category: {
            id: product.category.id,
            name: product.category.name,
        },
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
        status: product.status,
        isService: product.is_service,
        duration: product.duration,
        priority: product.priority,
        images: (product as any).images?.map((img: ProductImage) => {
            const raw = (img as any).image;
            let base64: string | undefined = undefined;
            let mime: string | undefined = undefined;
            try {
                let buf: Buffer | undefined;
                if (raw) {
                    if (Buffer.isBuffer(raw)) buf = raw as Buffer;
                    else if (raw.data && Array.isArray(raw.data)) buf = Buffer.from(raw.data);
                }
                if (buf) {
                    base64 = buf.toString('base64');
                    if (buf[0] === 0xff && buf[1] === 0xd8) mime = 'image/jpeg';
                    else if (buf[0] === 0x89 && buf[1] === 0x50) mime = 'image/png';
                    else mime = 'application/octet-stream';
                }
            } catch (e) {
                // ignore conversion errors and leave base64 undefined
            }

            return {
                id: img.id,
                productId: img.product_id,
                altText: img.alt_text,
                isMain: img.is_main,
                base64,
                mime,
            };
        }),
        createdAt: product.created_at,
        updatedAt: product.updated_at,
    };
}

export default mapProductToDto;
