import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/Backoffice/data-table/data-table';
import { PromotionEditorSheet } from '@/components/Backoffice/promotions/PromotionEditorSheet';
import { buildPromotionColumns } from '@/components/Backoffice/promotions/promotionTableColumns';
import { BackOfficeListToolbar } from '@/components/Backoffice/shared/BackOfficeListToolbar';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { BackOfficeStatusToggle } from '@/components/Backoffice/shared/BackOfficeStatusToggle';
import { useBackOfficePromotions } from '@/hooks/backoffice';
import { usePromotionEditor } from '@/hooks/backoffice/promotions/usePromotionEditor';
import { getBackOfficeErrorMessage } from '@/utils/backoffice/getBackOfficeErrorMessage';

export default function Discounts() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [search, setSearch] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'service' | 'product'>('all');
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { items, loading, error, refresh } = useBackOfficePromotions();
    const discountsErrorMessage = getBackOfficeErrorMessage(t, error);

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

    function openCreate() {
        setSelectedPromotionId(null);
        setSheetOpen(true);
    }

    function openEdit(promotionId: string) {
        setSelectedPromotionId(promotionId);
        setSheetOpen(true);
    }

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
            toast.success(t('backoffice.promotionDeleted'));
        },
    });

    async function handleDelete() {
        try {
            await editor.remove();
        } catch {
            toast.error(t('errorOccurred'));
        } finally {
            setConfirmDelete(false);
        }
    }

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

    function resetFilters() {
        setTypeFilter('all');
        setSearch('');
    }

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
                                        <Select
                                            value={typeFilter}
                                            onValueChange={(value) => setTypeFilter(value as 'all' | 'service' | 'product')}
                                        >
                                            <SelectTrigger className="h-9 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('allProducts')}</SelectItem>
                                                <SelectItem value="service">{t('service')}</SelectItem>
                                                <SelectItem value="product">{t('product')}</SelectItem>
                                            </SelectContent>
                                        </Select>
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

                {loading ? (
                    <div className="rounded-md border p-6 text-sm text-muted-foreground">{t('loading')}</div>
                ) : (
                    <DataTable data={filtered} columns={columns} onRowClick={(promotion) => openEdit(promotion.id)} />
                )}
                {!loading && discountsErrorMessage ? (
                    <p className="text-sm text-destructive">{discountsErrorMessage}</p>
                ) : null}
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
                onDelete={() => setConfirmDelete(true)}
            />

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('cart.remove')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('admin.confirmRefundDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={editor.deleting}>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void handleDelete()} disabled={editor.deleting}>
                            {editor.deleting ? t('loading') : t('admin.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
