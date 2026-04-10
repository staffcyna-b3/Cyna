import { Button } from './button';
import { useCart } from '@/hooks/useCart';
import { Period } from '@/types/Period';
import { PeriodEnum } from '@/types/enums/Period';
import { useTranslation } from 'react-i18next';

export default function PeriodModal({
    open,
    onClose,
    productId,
    productName,
    unitPrice,
}: {
    open: boolean;
    onClose: () => void;
    productId: string;
    productName?: string;
    unitPrice?: number;
}) {
    const { t } = useTranslation();
    const { addToCart } = useCart();

    if (!open) return null;

    const handleSelect = async (p: Period) => {
        try {
            await addToCart(productId, { period: p, name: productName, unitPrice, isService: true });
            onClose();
        } catch {
            // ignore
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-10 w-[92%] max-w-md bg-[#0b0920] rounded-2xl shadow-2xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-white">{t('selectPeriod')}</h3>
                <div className="flex flex-col gap-3">
                    <Button variant="default" onClick={() => handleSelect(PeriodEnum.ThreeMonths)}>{t('threeMonths')}</Button>
                    <Button variant="default" onClick={() => handleSelect(PeriodEnum.SixMonths)}>{t('sixMonths')}</Button>
                    <Button variant="default" onClick={() => handleSelect(PeriodEnum.OneYear)}>{t('oneYear')}</Button>
                    <div className="pt-2">
                        <Button variant="ghost" onClick={onClose} className="w-full">{t('cancel')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}