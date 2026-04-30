import type { BackOfficeProduct } from './BackOfficeProduct';

export type UseProductEditorParams = {
    product: BackOfficeProduct | null;
    onSaved: () => Promise<unknown> | void;
    onDeleted: () => Promise<unknown> | void;
};
