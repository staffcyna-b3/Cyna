import type { ReactNode } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type BackOfficeListToolbarProps = {
    searchValue: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    filterLabel: string;
    onSearchChange: (value: string) => void;
    onFilterClick?: () => void;
    filterActive?: boolean;
    filterPanel?: ReactNode;
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
};

export function BackOfficeListToolbar({
    searchValue,
    searchPlaceholder,
    searchAriaLabel,
    filterLabel,
    onSearchChange,
    onFilterClick,
    filterActive = false,
    filterPanel,
    leftSlot,
    rightSlot,
}: BackOfficeListToolbarProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">{leftSlot}{rightSlot}</div>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            aria-label={searchAriaLabel}
                            placeholder={searchPlaceholder}
                            className="h-10 border-gray-200 bg-gray-50 pl-8"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            'h-10 border-gray-200 text-gray-600',
                            filterActive && 'border-indigo-300 bg-indigo-50 text-indigo-700',
                        )}
                        onClick={onFilterClick}
                    >
                        <SlidersHorizontal className="size-4" />
                        {filterLabel}
                    </Button>
                </div>
                {filterPanel}
            </div>
        </div>
    );
}
