import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PromotionType } from '@/types/interfaces/backoffice/promotion';
import type { PromotionEditorSheetProps } from '@/types/interfaces/backoffice/promotion/PromotionEditorSheetProps';

export function PromotionEditorSheet({
    open,
    mode,
    title,
    subtitle,
    saveLabel,
    deleteLabel,
    cancelLabel,
    codeLabel,
    typeLabel,
    valueLabel,
    activeLabel,
    productSelectionLabel,
    productTypeServiceLabel,
    productTypePhysicalLabel,
    noProductsLabel,
    loadingLabel,
    code,
    discountType,
    discountValue,
    active,
    selectedProductIds,
    availableProducts,
    loadingDetails,
    loadingProducts,
    saving,
    deleting,
    onOpenChange,
    onCodeChange,
    onDiscountTypeChange,
    onDiscountValueChange,
    onActiveChange,
    onToggleProduct,
    onSave,
    onDelete,
}: PromotionEditorSheetProps) {
    const disabled = loadingDetails || saving || deleting;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[94vw] sm:max-w-160 p-0" showCloseButton={false}>
                <SheetHeader className="border-b border-gray-200 px-6 py-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <SheetTitle className="text-2xl font-semibold text-gray-900">{title}</SheetTitle>
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        </div>
                        <Button type="button" onClick={onSave} disabled={disabled}>
                            {saveLabel}
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-auto px-6 py-5">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-1.5 block text-sm text-gray-500">{codeLabel}</Label>
                                <Input
                                    value={code}
                                    onChange={(event) => onCodeChange(event.target.value)}
                                    disabled={disabled}
                                    placeholder="SPRING25"
                                />
                            </div>

                            <div>
                                <Label className="mb-1.5 block text-sm text-gray-500">{typeLabel}</Label>
                                <Select
                                    value={discountType}
                                    onValueChange={(value) => onDiscountTypeChange(value as PromotionType)}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="service">{productTypeServiceLabel}</SelectItem>
                                        <SelectItem value="product">{productTypePhysicalLabel}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-1.5 block text-sm text-gray-500">{valueLabel}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={discountValue}
                                    onChange={(event) => onDiscountValueChange(Number(event.target.value || 0))}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <Checkbox
                                        checked={active}
                                        onCheckedChange={(checked) => onActiveChange(Boolean(checked))}
                                        disabled={disabled}
                                    />
                                    {activeLabel}
                                </label>
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block text-sm text-gray-500">{productSelectionLabel}</Label>
                            <div className="rounded-md border border-gray-200">
                                {loadingProducts ? (
                                    <p className="px-3 py-4 text-sm text-gray-500">{loadingLabel}</p>
                                ) : availableProducts.length === 0 ? (
                                    <p className="px-3 py-4 text-sm text-gray-500">{noProductsLabel}</p>
                                ) : (
                                    <div className="max-h-80 overflow-auto divide-y divide-gray-100">
                                        {availableProducts.map((product) => {
                                            const checked = selectedProductIds.includes(product.id);
                                            return (
                                                <label
                                                    key={product.id}
                                                    className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={(next) => onToggleProduct(product.id, Boolean(next))}
                                                            disabled={disabled}
                                                        />
                                                        <span className="text-sm text-gray-800">{product.name}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{Number(product.price)} EUR</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-between">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
                        {cancelLabel}
                    </Button>
                    {mode === 'edit' ? (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onDelete}
                            disabled={saving || deleting}
                        >
                            {deleteLabel}
                        </Button>
                    ) : null}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
