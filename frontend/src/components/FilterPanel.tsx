import React from 'react';
import RangeSlider from './ui/RangeSliderRadix';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTranslation } from 'react-i18next';
import Select from './ui/Select';
import { cn } from '@/lib/utils';
import { FilterPanelProps } from '@/types/interfaces/catalog/FilterPanelProps';

export default function FilterPanel({
    open,
    onClose,
    onApply,

    localSearch,
    setLocalSearch,
    localMin,
    setLocalMin,
    localMax,
    setLocalMax,
    localInStock,
    setLocalInStock,
    localIsService,
    setLocalIsService,
    localSort,
    setLocalSort,

    sliderMin,
    sliderMax,
}: FilterPanelProps) {
    const { t } = useTranslation();

    const panelTransform = open
        ? 'translate-y-0 md:translate-x-0'
        : 'translate-y-full md:translate-x-full';

    return (
        <div
            aria-hidden={!open}
            className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}
        >
            <div
                className={`${open ? 'opacity-60 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed inset-0 bg-black transition-opacity duration-300`}
                onClick={onClose}
            />

            <aside
                role="dialog"
                aria-modal="true"
                className={`${panelTransform} fixed bottom-0 left-0 right-0 md:top-0 md:right-0 md:left-auto h-[70vh] md:h-full w-full md:w-96 bg-[#0b0920] shadow-2xl transition-transform duration-300 ease-in-out pointer-events-auto z-50 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl overflow-hidden flex flex-col`}
            >
                <div className="flex justify-center py-2 px-6 md:hidden flex-none">
                    <div className="w-12 h-1.5 bg-[#2a2a3d] rounded-full" />
                </div>

                <div className="flex items-center justify-between py-4 px-6 border-b border-[#12101b] flex-none gap-4">
                    <h2 className="text-lg sm:text-xl font-bold">
                        {t('filters')}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="flex-shrink-0 hover:bg-[#2a2a3d]"
                    >
                        ✕
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
                    <div>
                        <label className="text-xs sm:text-sm font-semibold text-[#b7bdd9] block mb-2">
                            {t('search')}
                        </label>
                        <Input
                            value={localSearch ?? ''}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setLocalSearch(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-[#12101b] border-[#2a2a3d] text-[#b7bdd9]"
                        />
                    </div>

                    <div>
                        <label className="text-xs sm:text-sm font-semibold text-[#b7bdd9] block mb-3">
                            {t('price')}
                        </label>
                        <RangeSlider
                            min={Math.floor(sliderMin)}
                            max={Math.ceil(sliderMax)}
                            valueMin={localMin}
                            valueMax={localMax}
                            onChange={(minV: number, maxV: number) => {
                                setLocalMin(minV);
                                setLocalMax(maxV);
                            }}
                        />
                        <div className="mt-2 text-xs text-[#9aa0c7]">
                            {localMin ?? sliderMin} — {localMax ?? sliderMax}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs sm:text-sm font-semibold text-[#b7bdd9] block mb-2">
                            {t('sortBy')}
                        </label>
                        <Select
                            className="w-full bg-[#12101b] border-[#2a2a3d] text-[#b7bdd9]"
                            value={localSort}
                            onChange={(
                                e: React.ChangeEvent<HTMLSelectElement>
                            ) => setLocalSort(e.target.value as string)}
                        >
                            <option value="">{t('defaultSort')}</option>
                            <option value={`price:asc`}>{t('priceAsc')}</option>
                            <option value={`price:desc`}>
                                {t('priceDesc')}
                            </option>
                            <option value={`priority:desc`}>
                                {t('priority')}
                            </option>
                        </Select>
                    </div>

                    <div>
                        <label className="text-xs sm:text-sm font-semibold text-[#b7bdd9] block mb-3">
                            {t('type')}
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={cn(
                                    'flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
                                    localIsService === undefined
                                        ? 'bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] text-white shadow-lg'
                                        : 'bg-[#12101b] text-[#9aa0c7] border border-[#2a2a3d] hover:border-[#7b61ff]'
                                )}
                                onClick={() => setLocalIsService(undefined)}
                            >
                                {t('all')}
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
                                    localIsService === false
                                        ? 'bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] text-white shadow-lg'
                                        : 'bg-[#12101b] text-[#9aa0c7] border border-[#2a2a3d] hover:border-[#7b61ff]'
                                )}
                                onClick={() => setLocalIsService(false)}
                            >
                                {t('products')}
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
                                    localIsService === true
                                        ? 'bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] text-white shadow-lg'
                                        : 'bg-[#12101b] text-[#9aa0c7] border border-[#2a2a3d] hover:border-[#7b61ff]'
                                )}
                                onClick={() => setLocalIsService(true)}
                            >
                                {t('services')}
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
                            localInStock
                                ? 'bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] text-white shadow-lg'
                                : 'bg-[#12101b] text-[#9aa0c7] border border-[#2a2a3d] hover:border-[#7b61ff]'
                        )}
                        onClick={() =>
                            setLocalInStock((prev) => (prev ? undefined : true))
                        }
                    >
                        {localInStock ? t('inStock') : t('showAllStock')}
                    </button>
                </div>

                <div className="flex gap-2 p-4 sm:p-6 border-t border-[#12101b] flex-none flex-col sm:flex-row">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onApply}
                        className="flex-1 font-semibold"
                    >
                        {t('apply')}
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onClose}
                        className="flex-1 font-semibold"
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </aside>
        </div>
    );
}
