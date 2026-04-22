import type { BackOfficePromotion } from './BackOfficePromotion';

export type UsePromotionEditorParams = {
    promotion: BackOfficePromotion | null;
    open: boolean;
    onSaved: () => Promise<unknown> | void;
    onDeleted: () => Promise<unknown> | void;
};
