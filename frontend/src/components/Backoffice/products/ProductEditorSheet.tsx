import { useRef } from 'react';
import { Upload } from 'lucide-react';
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

type ProductEditorSheetProps = {
    open: boolean;
    reference: string;
    title: string;
    saveLabel: string;
    deleteLabel: string;
    nameLabel: string;
    priceLabel: string;
    stockLabel: string;
    maintenanceLabel: string;
    descriptionLabel: string;
    imageLabel: string;
    imageActionLabel: string;
    imageLoadingLabel: string;
    imageEmptyLabel: string;
    name: string;
    price: number;
    stock: number;
    stockDisabled?: boolean;
    isService?: boolean;
    maintenance: boolean;
    description: string;
    imagePreview: string | null;
    imageLoading: boolean;
    imageUpdating: boolean;
    saving: boolean;
    deleting: boolean;
    onOpenChange: (open: boolean) => void;
    onNameChange: (value: string) => void;
    onPriceChange: (value: number) => void;
    onStockChange: (value: number) => void;
    onMaintenanceChange: (value: boolean) => void;
    onDescriptionChange: (value: string) => void;
    onImageFileChange: (file: File) => Promise<void> | void;
    onSave: () => void;
    onDelete: () => void;
};

export function ProductEditorSheet({
    open,
    reference,
    title,
    saveLabel,
    deleteLabel,
    nameLabel,
    priceLabel,
    stockLabel,
    maintenanceLabel,
    descriptionLabel,
    imageLabel,
    imageActionLabel,
    imageLoadingLabel,
    imageEmptyLabel,
    name,
    price,
    stock,
    stockDisabled = false,
    isService = false,
    maintenance,
    description,
    imagePreview,
    imageLoading,
    imageUpdating,
    saving,
    deleting,
    onOpenChange,
    onNameChange,
    onPriceChange,
    onStockChange,
    onMaintenanceChange,
    onDescriptionChange,
    onImageFileChange,
    onSave,
    onDelete,
}: ProductEditorSheetProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" showCloseButton={false} className="w-[94vw] sm:max-w-140 p-0">
                <SheetHeader className="border-b border-gray-200 px-6 py-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <SheetTitle className="text-3xl font-semibold text-gray-900">{reference}</SheetTitle>
                            <p className="text-sm text-gray-500">{title}</p>
                        </div>
                        <Button type="button" onClick={onSave} disabled={saving || deleting}>
                            {saveLabel}
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-auto px-6 py-5">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-1.5 block text-sm text-gray-500">{nameLabel}</Label>
                            <Input value={name} onChange={(event) => onNameChange(event.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-1.5 block text-sm text-gray-500">{priceLabel}</Label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(event) => onPriceChange(Number(event.target.value || 0))}
                                />
                            </div>
                            {isService ? (
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <Checkbox
                                            checked={maintenance}
                                            onCheckedChange={(checked) => onMaintenanceChange(Boolean(checked))}
                                        />
                                        {maintenanceLabel}
                                    </label>
                                </div>
                            ) : (
                                <div>
                                    <Label className="mb-1.5 block text-sm text-gray-500">{stockLabel}</Label>
                                    <Input
                                        type="number"
                                        value={stock}
                                        onChange={(event) => onStockChange(Number(event.target.value || 0))}
                                        disabled={stockDisabled}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <Label className="mb-1.5 block text-sm text-gray-500">{descriptionLabel}</Label>
                            <textarea
                                value={description}
                                onChange={(event) => onDescriptionChange(event.target.value)}
                                className="h-28 w-full rounded-md border border-gray-200 bg-white p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label className="text-sm text-gray-500">{imageLabel}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9"
                                    disabled={imageLoading || imageUpdating || saving || deleting}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imageActionLabel}
                                    <Upload className="size-4" />
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => {
                                        const selectedFile = event.target.files?.[0];
                                        if (!selectedFile) {
                                            return;
                                        }
                                        void onImageFileChange(selectedFile);
                                        event.target.value = '';
                                    }}
                                />
                            </div>
                            <div className="h-90 overflow-hidden rounded-md border border-dashed border-gray-300 bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] bg-size-[12px_12px]">
                                {imagePreview ? (
                                    <img src={imagePreview} alt={name || 'Product image'} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                        {imageLoading || imageUpdating ? imageLoadingLabel : imageEmptyLabel}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="border-t border-gray-200 px-6 py-4">
                    <Button
                        type="button"
                        variant="destructive"
                        className="ml-auto"
                        onClick={onDelete}
                        disabled={saving || deleting}
                    >
                        {deleteLabel}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
