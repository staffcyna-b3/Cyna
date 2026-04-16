import type { BackOfficeProduct } from '@/types/interfaces/backoffice/product';

export type UseProductEditorParams = {
    product: BackOfficeProduct | null;
    onSaved: () => Promise<unknown> | void;
    onDeleted: () => Promise<unknown> | void;
};