import { useEffect, useMemo, useState } from 'react';
import { BackOfficeApi } from '@/api/BackOfficeApi';
import {
    createBackOfficePromotion,
    deleteBackOfficePromotion,
    updateBackOfficePromotion,
    replaceBackOfficePromotionProducts,
} from '@/stores/backoffice/backOfficePromotionsStore';
import { ProductStatus } from '@/types/enums/product/ProductStatus';
import type {
    BackOfficePromotion,
    BackOfficePromotionProduct,
    PromotionType,
} from '@/types/interfaces/backoffice/promotion';
import type { BackOfficeProduct } from '@/types/interfaces/backoffice/product';
import type { PromotionFormState } from '@/types/interfaces/backoffice/promotion/PromotionFormState';
import type { UsePromotionEditorParams } from '@/types/interfaces/backoffice/promotion/UsePromotionEditorParams';

function toFormState(promotion: BackOfficePromotion | null): PromotionFormState {
    if (!promotion) {
        return {
            code: '',
            discountType: 'product',
            discountValue: 0,
            active: true,
            productIds: [],
        };
    }

    return {
        code: promotion.code,
        discountType: promotion.discount_type,
        discountValue: Number(promotion.discount_value ?? 0),
        active: Boolean(promotion.active),
        productIds: (promotion.products ?? []).map((product) => product.id),
    };
}

function mapLinkedProducts(products: BackOfficeProduct[]): BackOfficePromotionProduct[] {
    return products.map((product) => ({
        id: product.id,
        name: product.name,
        is_service: product.is_service,
        price: Number(product.price),
        priority: product.priority,
        status: product.status,
    }));
}

export function usePromotionEditor({
    promotion,
    open,
    onSaved,
    onDeleted,
}: UsePromotionEditorParams) {
    const service = useMemo(() => BackOfficeApi.getInstance(), []);
    const [form, setForm] = useState<PromotionFormState>(toFormState(promotion));
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [availableProducts, setAvailableProducts] = useState<BackOfficeProduct[]>([]);

    useEffect(() => {
        setForm(toFormState(promotion));
    }, [promotion]);

    useEffect(() => {
        if (!open || !promotion) {
            return;
        }

        const promotionId = promotion.id;

        async function loadPromotionDetails() {
            setLoadingDetails(true);
            try {
                const fullPromotion = await service.getPromotionById(promotionId);
                setForm(toFormState(fullPromotion));
            } finally {
                setLoadingDetails(false);
            }
        }

        void loadPromotionDetails();
    }, [open, promotion, service]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (form.discountType === 'cart') {
            setAvailableProducts([]);
            return;
        }

        async function loadProducts() {
            setLoadingProducts(true);
            try {
                const products = await service.listProducts({
                    is_service: form.discountType === 'service',
                    status: ProductStatus.AVAILABLE,
                });
                setAvailableProducts(products);

                const allowedIds = new Set(products.map((product) => product.id));
                setForm((prev) => ({
                    ...prev,
                    productIds: prev.productIds.filter((productId) => allowedIds.has(productId)),
                }));
            } finally {
                setLoadingProducts(false);
            }
        }

        void loadProducts();
    }, [open, form.discountType, service]);

    const mode: 'create' | 'edit' = promotion ? 'edit' : 'create';

    function setCode(value: string) {
        setForm((prev) => ({ ...prev, code: value.toUpperCase() }));
    }

    function setDiscountType(value: PromotionType) {
        setForm((prev) => ({ ...prev, discountType: value, productIds: [] }));
    }

    function setDiscountValue(value: number) {
        setForm((prev) => ({ ...prev, discountValue: value }));
    }

    function setActive(value: boolean) {
        setForm((prev) => ({ ...prev, active: value }));
    }

    function toggleProduct(productId: string, checked: boolean) {
        setForm((prev) => {
            if (checked) {
                if (prev.productIds.includes(productId)) {
                    return prev;
                }

                return {
                    ...prev,
                    productIds: [...prev.productIds, productId],
                };
            }

            return {
                ...prev,
                productIds: prev.productIds.filter((id) => id !== productId),
            };
        });
    }

    async function save() {
        setSaving(true);
        setSaveError(null);
        try {
            if (mode === 'create') {
                await createBackOfficePromotion({
                    code: form.code.trim(),
                    discount_type: form.discountType,
                    discount_value: Number(form.discountValue),
                    active: form.active,
                    product_ids: form.productIds,
                });
                await onSaved();
                return;
            }

            if (!promotion) {
                return;
            }

            const updated = await updateBackOfficePromotion(promotion.id, {
                code: form.code.trim(),
                discount_type: form.discountType,
                discount_value: Number(form.discountValue),
                active: form.active,
            });

            const currentLinkedIds = new Set((updated.products ?? []).map((product) => product.id));
            const nextLinkedIds = new Set(form.productIds);
            let needsLinkRefresh = currentLinkedIds.size !== nextLinkedIds.size;

            if (!needsLinkRefresh) {
                for (const id of currentLinkedIds) {
                    if (!nextLinkedIds.has(id)) {
                        needsLinkRefresh = true;
                        break;
                    }
                }
            }

            if (needsLinkRefresh) {
                await replaceBackOfficePromotionProducts(promotion.id, {
                    product_ids: form.productIds,
                });
            }

            await onSaved();
        } catch (error: unknown) {
            setSaveError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!promotion) {
            return;
        }

        setDeleting(true);
        setSaveError(null);
        try {
            await deleteBackOfficePromotion(promotion.id);
            await onDeleted();
        } catch (error: unknown) {
            setSaveError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setDeleting(false);
        }
    }

    const filteredAvailableProducts = useMemo(() => {
        const wantService = form.discountType === 'service';
        return availableProducts.filter((product) => product.is_service === wantService);
    }, [availableProducts, form.discountType]);

    const selectedProducts = useMemo(() => {
        const selectedIds = new Set(form.productIds);
        return mapLinkedProducts(filteredAvailableProducts.filter((product) => selectedIds.has(product.id)));
    }, [filteredAvailableProducts, form.productIds]);

    return {
        mode,
        form,
        loadingDetails,
        loadingProducts,
        saving,
        deleting,
        saveError,
        availableProducts,
        selectedProducts,
        setCode,
        setDiscountType,
        setDiscountValue,
        setActive,
        toggleProduct,
        save,
        remove,
    } as const;
}
