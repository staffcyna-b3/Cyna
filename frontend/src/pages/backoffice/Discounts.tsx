import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BackOfficeDataTable } from '@/components/Backoffice/data-table/BackOfficeDataTable';
import { PromotionEditorSheet } from '@/components/Backoffice/promotions/PromotionEditorSheet';
import { buildPromotionColumns } from '@/components/Backoffice/promotions/promotionTableColumns';
import { BackOfficeListToolbar } from '@/components/Backoffice/shared/BackOfficeListToolbar';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { BackOfficeStatusToggle } from '@/components/Backoffice/shared/BackOfficeStatusToggle';
import { useBackOfficePromotions } from '@/hooks/backoffice';
import { usePromotionEditor } from '@/hooks/backoffice/promotions/usePromotionEditor';

export default function Discounts() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [search, setSearch] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'service' | 'product'>('all');
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

    const { items, loading, error, refresh } = useBackOfficePromotions();

    const selectedPromotion = useMemo(
        () => items.find((promotion) => promotion.id === selectedPromotionId) ?? null,
        [items, selectedPromotionId],
    );

    const filtered = useMemo(() => {
        return items.filter((promotion) => {
            const statusMatch = status === 'active' ? promotion.active : !promotion.active;
            const searchValue = search.trim().toLowerCase();
            const searchMatch =
                !searchValue || promotion.code.toLowerCase().includes(searchValue);
            const typeMatch = typeFilter === 'all' || promotion.discount_type === typeFilter;
            return statusMatch && searchMatch && typeMatch;
        });
    }, [items, search, status, typeFilter]);

    const columns = useMemo(() => buildPromotionColumns(t), [t]);

    const editor = usePromotionEditor({
        promotion: selectedPromotion,
        open: sheetOpen,
        onSaved: async () => {
            await refresh();
            setSheetOpen(false);
            setSelectedPromotionId(null);
        },
        onDeleted: async () => {
            await refresh();
            setSheetOpen(false);
            setSelectedPromotionId(null);
        },
    });

    const openCreate = () => {
        setSelectedPromotionId(null);
        setSheetOpen(true);
    };

    const openEdit = (promotionId: string) => {
        setSelectedPromotionId(promotionId);
        setSheetOpen(true);
    };

    useEffect(() => {
        if (searchParams.get('create') !== '1') {
            return;
        }

        setSelectedPromotionId(null);
        setSheetOpen(true);

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('create');
        setSearchParams(nextParams, { replace: true });
    }, [searchParams, setSearchParams]);

    const resetFilters = () => {
        setTypeFilter('all');
        setSearch('');
    };

    return (
        <>
            <BackOfficePageHeader
                title={t('discounts')}
                rightSlot={
                    <BackOfficeStatusToggle
                        value={status}
                        activeLabel={t('active')}
                        inactiveLabel={t('inactive')}
                        onChange={setStatus}
                    />
                }
            />

            <div className="px-6 pb-6 space-y-3">
                <BackOfficeListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder={t('backoffice.searchPromotionCode')}
                    searchAriaLabel={t('search')}
                    filterLabel={t('filters')}
                    onFilterClick={() => setIsFilterOpen((prev) => !prev)}
                    filterActive={typeFilter !== 'all'}
                    filterPanel={
                        isFilterOpen ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                                    <div>
                                        <Label className="mb-1.5 block text-sm text-gray-600">
                                            {t('backoffice.discountType')}
                                        </Label>
                                        <select
                                            value={typeFilter}
                                            onChange={(event) => setTypeFilter(event.target.value as 'all' | 'service' | 'product')}
                                            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        >
                                            <option value="all">{t('allProducts')}</option>
                                            <option value="service">{t('service')}</option>
                                            <option value="product">{t('product')}</option>
                                        </select>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9"
                                        onClick={resetFilters}
                                    >
                                        {t('resetFilters')}
                                    </Button>
                                </div>
                            </div>
                        ) : null
                    }
                    leftSlot={
                        <Button type="button" className="h-9" onClick={openCreate}>
                            {t('backoffice.createDiscount')}
                        </Button>
                    }
                />

                <BackOfficeDataTable
                    data={filtered}
                    columns={columns}
                    loading={loading}
                    emptyLabel={error || t('backoffice.noDiscounts')}
                    getRowId={(row) => row.id}
                    onRowClick={(row) => openEdit(row.id)}
                />
            </div>

            <PromotionEditorSheet
                open={sheetOpen}
                mode={editor.mode}
                title={
                    editor.mode === 'create'
                        ? t('backoffice.createDiscount')
                        : t('backoffice.editDiscount')
                }
                subtitle={t('backoffice.promotionConfiguration')}
                saveLabel={t('backoffice.save')}
                deleteLabel={t('cart.remove')}
                cancelLabel={t('cancel')}
                codeLabel={t('backoffice.code')}
                typeLabel={t('backoffice.discountType')}
                valueLabel={t('backoffice.discountValue')}
                activeLabel={t('active')}
                productSelectionLabel={t('backoffice.productsSelection')}
                productTypeServiceLabel={t('service')}
                productTypePhysicalLabel={t('product')}
                noProductsLabel={t('noProducts')}
                loadingLabel={t('loading')}
                code={editor.form.code}
                discountType={editor.form.discountType}
                discountValue={editor.form.discountValue}
                active={editor.form.active}
                selectedProductIds={editor.form.productIds}
                availableProducts={editor.availableProducts}
                loadingDetails={editor.loadingDetails}
                loadingProducts={editor.loadingProducts}
                saving={editor.saving}
                deleting={editor.deleting}
                onOpenChange={(open) => {
                    setSheetOpen(open);
                    if (!open) {
                        setSelectedPromotionId(null);
                    }
                }}
                onCodeChange={editor.setCode}
                onDiscountTypeChange={editor.setDiscountType}
                onDiscountValueChange={editor.setDiscountValue}
                onActiveChange={editor.setActive}
                onToggleProduct={editor.toggleProduct}
                onSave={editor.save}
                onDelete={editor.remove}
            />
        </>
    );
}
