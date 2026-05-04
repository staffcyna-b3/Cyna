import { HttpError } from '../common/httpError';
import { ProductStatus } from '../enum/ProductStatus';
import { CategoryType } from '../enum/CategoryType';
import {
    CreateProductDto,
    ProductImageDto,
    ProductFiltersDto,
    ReorderDisplayPriorityItemDto,
    UpdateProductImageDto,
    UpdateProductDto,
    UpdateStockDto,
} from '../dto/product';
import { IProductRepository } from '../interfaces/IProductRepository';
import { IProductService } from '../interfaces/IProductService';

export class ProductService implements IProductService {
    constructor(private readonly productRepository: IProductRepository) { }

    async list(filters: ProductFiltersDto) {
        return this.productRepository.list(filters);
    }

    async getById(id: string) {
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new HttpError(404, 'Produit introuvable');
        }

        return product;
    }

    async create(input: CreateProductDto) {
        await this.validateCategoryCompatibility(input.category_id, input.is_service);
        this.validateProductData(input, input.is_service);

        const slug = await this.productRepository.generateUniqueSlug(input.name);

        const payload = {
            ...input,
            slug,
            description: input.description ?? null,
            priority: input.priority ?? 0,
            stock: input.is_service ? 0 : (input.stock ?? 0),
            duration: input.is_service ? (input.duration ?? null) : null,
            status: input.status ?? ProductStatus.AVAILABLE,
        };

        return this.productRepository.create(payload);
    }

    async update(id: string, input: UpdateProductDto) {
        const product = await this.getById(id);

        const nextIsService = product.is_service;
        const nextCategoryId = input.category_id ?? product.category_id;
        const nextName = input.name ?? product.name;

        await this.validateCategoryCompatibility(nextCategoryId, nextIsService);
        this.validateProductData(
            {
                category_id: nextCategoryId,
                name: nextName,
                description: input.description ?? product.description,
                price: input.price ?? Number(product.price),
                stock: input.stock ?? product.stock,
                duration: input.duration ?? product.duration,
                priority: input.priority ?? product.priority,
                is_service: nextIsService,
                status: input.status ?? product.status,
            },
            nextIsService,
        );

        const slug = input.name
            ? await this.productRepository.generateUniqueSlug(nextName, id)
            : undefined;

        await this.productRepository.update(product, {
            ...input,
            ...(slug ? { slug } : {}),
            duration: nextIsService ? (input.duration ?? product.duration) : null,
            stock: nextIsService ? 0 : (input.stock ?? product.stock),
        });

        return this.getById(id);
    }

    async remove(id: string) {
        const product = await this.getById(id);
        await this.productRepository.delete(product);
        return { deleted: true };
    }

    async updateStock(id: string, input: UpdateStockDto) {
        const product = await this.getById(id);

        if (product.is_service) {
            throw new HttpError(400, 'Le stock ne s\'applique pas aux produits SaaS');
        }

        if (!Number.isInteger(input.quantity) || input.quantity < 0) {
            throw new HttpError(400, 'La quantite doit etre un entier positif');
        }

        let newStock = product.stock;

        if (input.operation === 'set') {
            newStock = input.quantity;
        }

        if (input.operation === 'increment') {
            newStock = product.stock + input.quantity;
        }

        if (input.operation === 'decrement') {
            newStock = product.stock - input.quantity;
            if (newStock < 0) {
                throw new HttpError(400, 'Le stock ne peut pas etre negatif');
            }
        }

        await this.productRepository.update(product, {
            stock: newStock,
            status: newStock > 0 ? ProductStatus.AVAILABLE : ProductStatus.UNAVAILABLE,
        });

        return this.getById(id);
    }

    async getImage(id: string): Promise<ProductImageDto> {
        await this.getById(id);
        const image = await this.productRepository.findMainImage(id);

        if (!image) {
            return {
                image_base64: null,
                mime_type: null,
                alt_text: null,
            };
        }

        const imageBuffer = Buffer.from(image.image);

        return {
            image_base64: imageBuffer.toString('base64'),
            mime_type: this.detectMimeType(imageBuffer),
            alt_text: image.alt_text ?? null,
        };
    }

    async updateImage(id: string, input: UpdateProductImageDto): Promise<ProductImageDto> {
        await this.getById(id);

        const imageBuffer = this.decodeBase64Image(input.image_base64);
        await this.productRepository.upsertMainImage(id, imageBuffer, input.alt_text ?? null);

        return this.getImage(id);
    }

    async setMaintenance(id: string, maintenance: boolean) {
        const product = await this.getById(id);

        if (maintenance) {
            await this.productRepository.update(product, { status: ProductStatus.UNAVAILABLE });
            return this.getById(id);
        }

        const shouldBeAvailable = product.is_service || product.stock > 0;
        await this.productRepository.update(product, {
            status: shouldBeAvailable ? ProductStatus.AVAILABLE : ProductStatus.UNAVAILABLE,
        });

        return this.getById(id);
    }

    async updatePriority(id: string, priority: number) {
        if (!Number.isInteger(priority) || priority < 0) {
            throw new HttpError(400, 'La priorite doit etre un entier positif');
        }

        const product = await this.getById(id);
        await this.productRepository.update(product, { priority });
        return this.getById(id);
    }

    async reorderDisplayPriority(items: ReorderDisplayPriorityItemDto[]) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new HttpError(400, 'La liste de priorites est obligatoire');
        }

        const invalidItem = items.find((item) => !item?.id || !Number.isInteger(item.priority) || item.priority < 0);
        if (invalidItem) {
            throw new HttpError(400, 'Chaque element doit contenir id et priority valide');
        }

        try {
            return await this.productRepository.reorderDisplayPriority(items);
        } catch (error: unknown) {
            if (error instanceof Error && error.message.startsWith('PRODUCT_NOT_FOUND:')) {
                const productId = error.message.replace('PRODUCT_NOT_FOUND:', '');
                throw new HttpError(404, `Produit introuvable: ${productId}`);
            }

            throw error;
        }
    }

    private async validateCategoryCompatibility(categoryId: string, isService: boolean) {
        const category = await this.productRepository.findCategoryById(categoryId);

        if (!category) {
            throw new HttpError(400, 'Categorie introuvable');
        }

        if (isService && category.type !== CategoryType.SERVICE) {
            throw new HttpError(400, 'Un produit SaaS doit appartenir a une categorie de type service');
        }

        if (!isService && category.type !== CategoryType.PRODUCT) {
            throw new HttpError(400, 'Un produit physique doit appartenir a une categorie de type product');
        }
    }

    private validateProductData(input: CreateProductDto, isService: boolean) {
        if (!input.name || input.name.trim().length < 2) {
            throw new HttpError(400, 'Le nom du produit doit contenir au moins 2 caracteres');
        }

        if (!Number.isFinite(input.price) || input.price < 0) {
            throw new HttpError(400, 'Le prix doit etre un nombre positif');
        }

        if (!Number.isInteger(input.priority ?? 0) || (input.priority ?? 0) < 0) {
            throw new HttpError(400, 'La priorite doit etre un entier positif');
        }

        if (isService) {
            if (input.duration === undefined || input.duration === null || !Number.isInteger(input.duration) || input.duration <= 0) {
                throw new HttpError(400, 'La duree est obligatoire pour un produit SaaS');
            }
            return;
        }

        if (input.stock !== undefined && (!Number.isInteger(input.stock) || input.stock < 0)) {
            throw new HttpError(400, 'Le stock doit etre un entier positif');
        }
    }

    private decodeBase64Image(imageBase64: string): Buffer {
        const raw = imageBase64.trim();
        const commaIndex = raw.indexOf(',');
        const base64Data = raw.startsWith('data:') && commaIndex > -1 ? raw.slice(commaIndex + 1) : raw;

        const decoded = Buffer.from(base64Data, 'base64');

        if (!decoded.length) {
            throw new HttpError(400, 'Image invalide');
        }

        const maxBytes = 5 * 1024 * 1024;
        if (decoded.length > maxBytes) {
            throw new HttpError(400, 'Image trop volumineuse (max 5MB)');
        }

        return decoded;
    }

    private detectMimeType(buffer: Buffer): string {
        if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
            return 'image/png';
        }

        if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
            return 'image/jpeg';
        }

        if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
            return 'image/gif';
        }

        if (
            buffer.length >= 12 &&
            buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
            buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
        ) {
            return 'image/webp';
        }

        return 'application/octet-stream';
    }
}

