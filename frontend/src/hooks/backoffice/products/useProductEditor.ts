import { useEffect, useState } from 'react';
import {
    deleteBackOfficeProduct,
    fetchBackOfficeProductImage,
    setBackOfficeProductMaintenance,
    updateBackOfficeProduct,
    updateBackOfficeProductImage,
} from '@/stores/backoffice/backOfficeProductsStore';
import { ProductStatus } from '@/types/enums/product/ProductStatus';
import type { BackOfficeProduct } from '@/types/interfaces/backoffice/product';
import type { ProductFormState } from './types/ProductFormState';
import type { UseProductEditorParams } from './types/UseProductEditorParams';

function toFormState(product: BackOfficeProduct | null): ProductFormState {
    if (!product) {
        return {
            name: '',
            price: 0,
            stock: 0,
            description: '',
            maintenance: false,
        };
    }

    return {
        name: product.name,
        price: Number(product.price ?? 0),
        stock: Number(product.stock ?? 0),
        description: product.description ?? '',
        maintenance: product.is_service && product.status === ProductStatus.UNAVAILABLE,
    };
}

export function useProductEditor({
    product,
    onSaved,
    onDeleted,
}: UseProductEditorParams) {
    const [form, setForm] = useState<ProductFormState>(toFormState(product));
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageUpdating, setImageUpdating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setForm(toFormState(product));
    }, [product]);

    useEffect(() => {
        if (!product) {
            setImagePreview(null);
            return;
        }

        const loadImage = async () => {
            setImageLoading(true);
            try {
                const image = await fetchBackOfficeProductImage(product.id);
                if (!image.image_base64) {
                    setImagePreview(null);
                    return;
                }

                const mimeType = image.mime_type || 'image/jpeg';
                setImagePreview(`data:${mimeType};base64,${image.image_base64}`);
            } catch {
                setImagePreview(null);
            } finally {
                setImageLoading(false);
            }
        };

        void loadImage();
    }, [product]);

    const setName = (value: string) => {
        setForm((prev) => ({ ...prev, name: value }));
    };

    const setPrice = (value: number) => {
        setForm((prev) => ({ ...prev, price: value }));
    };

    const setStock = (value: number) => {
        setForm((prev) => ({ ...prev, stock: value }));
    };

    const setDescription = (value: string) => {
        setForm((prev) => ({ ...prev, description: value }));
    };

    const setMaintenance = (value: boolean) => {
        setForm((prev) => ({ ...prev, maintenance: value }));
    };

    const save = async () => {
        if (!product) {
            return;
        }

        setSaving(true);
        try {
            const updated = await updateBackOfficeProduct(product.id, {
                name: form.name,
                price: Number(form.price),
                stock: product.is_service ? undefined : Number(form.stock),
                description: form.description || null,
            });

            if (product.is_service) {
                await setBackOfficeProductMaintenance(updated.id, {
                    maintenance: form.maintenance,
                });
            }

            await onSaved();
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!product) {
            return;
        }

        setDeleting(true);
        try {
            await deleteBackOfficeProduct(product.id);
            await onDeleted();
        } finally {
            setDeleting(false);
        }
    };

    const changeImage = async (file: File) => {
        if (!product || !file.type.startsWith('image/')) {
            return;
        }

        const fileAsDataUrl = await toDataUrl(file);

        setImageUpdating(true);
        try {
            const nextImage = await updateBackOfficeProductImage(product.id, {
                image_base64: fileAsDataUrl,
            });

            if (!nextImage.image_base64) {
                setImagePreview(null);
                return;
            }

            const mimeType = nextImage.mime_type || file.type || 'image/jpeg';
            setImagePreview(`data:${mimeType};base64,${nextImage.image_base64}`);
        } finally {
            setImageUpdating(false);
        }
    };

    return {
        form,
        imagePreview,
        imageLoading,
        imageUpdating,
        saving,
        deleting,
        setName,
        setPrice,
        setStock,
        setDescription,
        setMaintenance,
        save,
        remove,
        changeImage,
    } as const;
}

function toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error('Unable to read file as data URL'));
                return;
            }

            resolve(reader.result);
        };

        reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'));
        reader.readAsDataURL(file);
    });
}

