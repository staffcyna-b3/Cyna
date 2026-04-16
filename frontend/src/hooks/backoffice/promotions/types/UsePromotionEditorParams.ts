import type { BackOfficePromotion } from '@/types/interfaces/backoffice/promotion';

export type UsePromotionEditorParams = {
    promotion: BackOfficePromotion | null;
    open: boolean;
    onSaved: () => Promise<unknown> | void;
    onDeleted: () => Promise<unknown> | void;
};