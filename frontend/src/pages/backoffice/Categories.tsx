import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BackOfficePageHeader } from '@/components/Backoffice/shared/BackOfficePageHeader';
import { Button } from '@/components/ui/button';
import { useBackOfficeCategories } from '@/hooks/backoffice';
import { useCategoryOrderEditor } from '@/hooks/backoffice/categories/useCategoryOrderEditor';
import { getBackOfficeErrorMessage } from '@/utils/backoffice/getBackOfficeErrorMessage';

export default function Categories() {
    const { t } = useTranslation();
    const query = useMemo(() => ({ type: 'service' as const }), []);
    const { items, loading, error } = useBackOfficeCategories(query, { autoFetch: true });
    const editor = useCategoryOrderEditor(items);
    const categoriesErrorMessage = getBackOfficeErrorMessage(t, error);

    return (
        <>
            <BackOfficePageHeader
                title={t('categories.label')}
                rightSlot={
                    <Button
                        type="button"
                        className="h-9"
                        onClick={() => void editor.save()}
                        disabled={loading || editor.saving || !editor.hasChanges}
                    >
                        {t('backoffice.saveOrder')}
                    </Button>
                }
            />

            <div className="px-6 pb-6 space-y-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    {t('backoffice.reorderServiceCategories')}
                </div>

                {!loading && categoriesErrorMessage ? (
                    <p className="text-sm text-destructive">{categoriesErrorMessage}</p>
                ) : null}

                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {loading ? (
                        <div className="px-4 py-10 text-sm text-center text-gray-500">{t('loading')}</div>
                    ) : editor.orderedItems.length === 0 ? (
                        <div className="px-4 py-10 text-sm text-center text-gray-500">{t('noCategory')}</div>
                    ) : (
                        <ul>
                            {editor.orderedItems.map((category, index) => (
                                <li
                                    key={category.id}
                                    className="flex items-center justify-between gap-4 border-b last:border-b-0 border-gray-100 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {index + 1}. {category.name}
                                        </p>
                                        {category.description ? (
                                            // Category descriptions are i18n keys (snake_case).
                                            // Add new keys to fr.json and en.json when creating categories in the back-office.
                                            <p className="text-sm text-gray-600 line-clamp-2">{t(`categories.${category.description}.description`)}</p>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => editor.moveUp(index)}
                                            disabled={index === 0 || editor.saving}
                                            aria-label={t('backoffice.moveUp')}
                                        >
                                            <ArrowUp size={14} />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => editor.moveDown(index)}
                                            disabled={index === editor.orderedItems.length - 1 || editor.saving}
                                            aria-label={t('backoffice.moveDown')}
                                        >
                                            <ArrowDown size={14} />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
