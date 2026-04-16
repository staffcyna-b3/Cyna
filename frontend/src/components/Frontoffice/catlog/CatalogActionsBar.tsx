import { SlidersHorizontal, ArrowUpWideNarrow } from 'lucide-react';

interface CatalogActionsBarProps {
    filtersLabel: string;
    currentSortLabel: string;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    onOpenFilters: () => void;
    onOpenSort: () => void;
}

export default function CatalogActionsBar({
    filtersLabel,
    currentSortLabel,
    hasActiveFilters,
    activeFilterCount,
    onOpenFilters,
    onOpenSort,
}: CatalogActionsBarProps) {
    return (
        <div className="inline-flex w-full max-w-max items-center rounded-[24px] border border-white/10 bg-[rgba(52,52,72,0.92)] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-md">
            <button
                type="button"
                onClick={onOpenFilters}
                className="inline-flex min-w-32.5 items-center justify-center gap-2 rounded-[18px] bg-[#4a44df] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5a55eb] sm:text-base"
            >
                <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{filtersLabel}</span>
                {hasActiveFilters && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/18 px-1 text-[11px] font-bold text-white">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            <button
                type="button"
                onClick={onOpenSort}
                className="inline-flex min-w-30 items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/8 sm:text-base"
            >
                <ArrowUpWideNarrow className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{currentSortLabel}</span>
            </button>
        </div>
    );
}
