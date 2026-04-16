import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BackOfficeDataTable } from '@/components/Backoffice/data-table/BackOfficeDataTable';
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

export default function Products() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const state = useProductsPageState();

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

    const selectedProduct = useMemo(
        () => items.find((item) => item.id === state.selectedProductId) ?? null,
        [items, state.selectedProductId],
    );

    const columns = useMemo(() => buildProductColumns(t), [t]);

    const editor = useProductEditor({
        product: selectedProduct,
        onSaved: refresh,
        onDeleted: async () => {
            await refresh();
            state.closeProductEditor();
        },
    });

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
                                        <select
                                            value={state.type}
                                            onChange={(event) => {
                                                const nextType = event.target.value as 'all' | 'product' | 'service';
                                                state.setType(nextType);
                                                state.setCategoryId('');
                                            }}
                                            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        >
                                            <option value="all">{t('allProducts')}</option>
                                            <option value="product">{t('product')}</option>
                                            <option value="service">{t('service')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label className="mb-1.5 block text-sm text-gray-600">
                                            {t('backoffice.category')}
                                        </Label>
                                        <select
                                            value={state.categoryId}
                                            onChange={(event) => state.setCategoryId(event.target.value)}
                                            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        >
                                            <option value="">{t('allProducts')}</option>
                                            {filteredCategoryOptions.map((option) => (
                                                <option key={option.id} value={option.id}>
                                                    {option.name}
                                                </option>
                                            ))}
                                        </select>
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

                <BackOfficeDataTable
                    data={items}
                    columns={columns}
                    loading={loading}
                    emptyLabel={error || t('noProducts')}
                    enableRowSelection
                    getRowId={(row) => row.id}
                    rowSelection={state.rowSelection}
                    onRowSelectionChange={state.setRowSelection}
                    onRowClick={(row) => state.openProductEditor(row.id)}
                />
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
                onDelete={editor.remove}
            />
        </>
    );
}
