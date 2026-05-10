import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { ProductEditorSheet } from '@/components/Backoffice/products/ProductEditorSheet';
import {
    buildProductColumns,
    getProductReference,
} from '@/components/Backoffice/products/productTableColumns';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { BackOfficeStatusToggle } from '@/components/Backoffice/shared/BackOfficeStatusToggle';
import { BackOfficeListToolbar } from '@/components/Backoffice/shared/BackOfficeListToolbar';
import { useBackOfficeCategoryOptions, useBackOfficeProducts } from '@/hooks/backoffice';
import { useProductEditor } from '@/hooks/backoffice/products/useProductEditor';
import { useProductsPageState } from '@/hooks/backoffice/products/useProductsPageState';
import { getBackOfficeErrorMessage } from '@/utils/backoffice/getBackOfficeErrorMessage';

export default function Products() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const state = useProductsPageState();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const categoryQuery = useMemo(() => ({}), []);

    const { options: categoryOptions } = useBackOfficeCategoryOptions(
        categoryQuery,
        { autoFetch: true },
    );

    const filteredCategoryOptions = useMemo(() => {
        if (state.type === 'all') {
            return categoryOptions;
        }

        return categoryOptions.filter((option) => option.type === state.type);
    }, [categoryOptions, state.type]);

    const { items, loading, error, refresh } = useBackOfficeProducts(state.query, {
        autoFetch: true,
    });
    const productsErrorMessage = getBackOfficeErrorMessage(t, error);

    const selectedProduct = useMemo(
        () => items.find((item) => item.id === state.selectedProductId) ?? null,
        [items, state.selectedProductId],
    );

    const filteredItems = useMemo(() => {
        if (state.type === 'all') return items;
        return items.filter((item) => item.is_service === (state.type === 'service'));
    }, [items, state.type]);

    const columns = useMemo(() => buildProductColumns(t), [t]);

    const editor = useProductEditor({
        product: selectedProduct,
        onSaved: refresh,
        onDeleted: async () => {
            await refresh();
            state.closeProductEditor();
            toast.success(t('backoffice.productDeleted'));
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

    return (
        <>
            <BackOfficePageHeader
                title={t('products')}
                rightSlot={
                    <BackOfficeStatusToggle
                        value={state.status}
                        activeLabel={t('active')}
                        inactiveLabel={t('inactive')}
                        onChange={state.setStatus}
                    />
                }
            />

            <div className="px-6 pb-6 space-y-3">
                <BackOfficeListToolbar
                    searchValue={state.search}
                    onSearchChange={state.setSearch}
                    searchPlaceholder={t('backoffice.searchByNameOrReference')}
                    searchAriaLabel={t('search')}
                    filterLabel={t('filters')}
                    onFilterClick={() => state.setIsFilterOpen(!state.isFilterOpen)}
                    filterActive={Boolean(state.categoryId) || state.type !== 'all'}
                    filterPanel={
                        state.isFilterOpen ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                    <div>
                                        <Label className="mb-1.5 block text-sm text-gray-600">
                                            {t('backoffice.type')}
                                        </Label>
                                        <Select
                                            value={state.type}
                                            onValueChange={(value) => {
                                                const nextType = value as 'all' | 'product' | 'service';
                                                state.setType(nextType);
                                                state.setCategoryId('');
                                            }}
                                        >
                                            <SelectTrigger className="h-9 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('allProducts')}</SelectItem>
                                                <SelectItem value="product">{t('product')}</SelectItem>
                                                <SelectItem value="service">{t('service')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="mb-1.5 block text-sm text-gray-600">
                                            {t('backoffice.category')}
                                        </Label>
                                        <Select
                                            value={state.categoryId || '__all__'}
                                            onValueChange={(value) => state.setCategoryId(value === '__all__' ? '' : value)}
                                        >
                                            <SelectTrigger className="h-9 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">{t('allProducts')}</SelectItem>
                                                {filteredCategoryOptions.map((option) => (
                                                    <SelectItem key={option.id} value={option.id}>
                                                        {option.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9"
                                        onClick={state.resetFilters}
                                    >
                                        {t('resetFilters')}
                                    </Button>
                                </div>
                            </div>
                        ) : null
                    }
                    leftSlot={
                        <Button
                            type="button"
                            className="h-9"
                            onClick={() => navigate('/discounts?create=1')}
                        >
                            {t('backoffice.createNewPromotion')}
                        </Button>
                    }
                    rightSlot={
                        <Button
                            type="button"
                            variant="destructive"
                            className="h-9"
                            disabled={state.selectedCount === 0}
                        >
                            {t('cart.remove')}
                        </Button>
                    }
                />

                {loading ? (
                    <div className="rounded-md border p-6 text-sm text-muted-foreground">{t('loading')}</div>
                ) : (
                    <DataTable data={filteredItems} columns={columns} onRowClick={(product) => state.openProductEditor(product.id)} />
                )}
                {!loading && productsErrorMessage ? (
                    <p className="text-sm text-destructive">{productsErrorMessage}</p>
                ) : null}
            </div>

            <ProductEditorSheet
                open={state.sheetOpen}
                reference={selectedProduct ? getProductReference(selectedProduct) : ''}
                title={t('product')}
                saveLabel={t('backoffice.save')}
                deleteLabel={t('cart.remove')}
                nameLabel={t('backoffice.name')}
                priceLabel={t('price')}
                stockLabel={t('backoffice.stockQuantity')}
                maintenanceLabel={t('maintenance')}
                descriptionLabel={t('backoffice.description')}
                imageLabel={t('backoffice.image')}
                imageActionLabel={t('backoffice.changeImage')}
                imageLoadingLabel={t('loading')}
                imageEmptyLabel={t('backoffice.noImage')}
                name={editor.form.name}
                price={editor.form.price}
                stock={editor.form.stock}
                stockDisabled={Boolean(selectedProduct?.is_service)}
                isService={Boolean(selectedProduct?.is_service)}
                maintenance={editor.form.maintenance}
                description={editor.form.description}
                imagePreview={editor.imagePreview}
                imageLoading={editor.imageLoading}
                imageUpdating={editor.imageUpdating}
                saving={editor.saving}
                deleting={editor.deleting}
                onOpenChange={(open) => {
                    state.setSheetOpen(open);
                    if (!open) {
                        state.closeProductEditor();
                    }
                }}
                onNameChange={editor.setName}
                onPriceChange={editor.setPrice}
                onStockChange={editor.setStock}
                onMaintenanceChange={editor.setMaintenance}
                onDescriptionChange={editor.setDescription}
                onImageFileChange={editor.changeImage}
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
