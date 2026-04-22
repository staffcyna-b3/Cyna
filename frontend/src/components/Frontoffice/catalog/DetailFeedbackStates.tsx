import { JSX } from 'react';
import CatalogLayout from '@/layouts/CatalogLayout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import {
    DetailErrorStateProps,
    DetailStateProps,
} from '@/types/interfaces/catalog/DetailFeedbackStatesProps';

export function DetailLoadingState(): JSX.Element {
    return (
        <CatalogLayout>
            <div className="p-6 md:min-h-screen">
                <LoadingSkeleton count={3} />
            </div>
        </CatalogLayout>
    );
}

export function DetailErrorState({
    error,
    onRetry,
    onBack,
    t,
}: DetailErrorStateProps): JSX.Element {
    return (
        <CatalogLayout>
            <div className="p-6 md:min-h-screen flex items-center justify-center">
                <div className="max-w-lg w-full border border-red-700 rounded-xl p-8 text-center">
                    <div className="text-red-400 text-lg font-semibold mb-2">
                        {t('errorOccurred')}
                    </div>
                    <div className="text-sm text-red-200 mb-6 wrap-break-words">
                        {error}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <Button onClick={onRetry}>{t('retry')}</Button>
                        <Button variant="ghost" onClick={onBack}>{t('back')}</Button>
                    </div>
                </div>
            </div>
        </CatalogLayout>
    );
}

export function DetailEmptyState({ t }: DetailStateProps): JSX.Element {
    return (
        <CatalogLayout>
            <div className="p-6 md:min-h-screen flex items-center justify-center">
                <div className="text-center text-[#9aa0c7]">{t('noProducts')}</div>
            </div>
        </CatalogLayout>
    );
}
