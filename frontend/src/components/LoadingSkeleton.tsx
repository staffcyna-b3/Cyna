import React from 'react';

type LoadingSkeletonProps = {
    /** Number of skeleton items to render */
    count?: number;
    /** Layout variant */
    layout?: 'grid' | 'list' | 'inline';
    /** Number of columns for grid layout (1..6) */
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Optional container className */
    className?: string;
    /** Optional per-item className */
    itemClassName?: string;
    /** Accessible label */
    ariaLabel?: string;
};

const gridColsClass = (cols: number) => {
    switch (cols) {
        case 1:
            return 'grid-cols-1';
        case 2:
            return 'grid-cols-1 sm:grid-cols-2';
        case 3:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
        case 4:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
        case 5:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
        case 6:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
        default:
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    count = 8,
    layout = 'grid',
    columns = 4,
    className = '',
    itemClassName = '',
    ariaLabel = 'Loading content',
}) => {
    const items = Array.from({ length: count });

    if (layout === 'list') {
        return (
            <div
                className={'space-y-4 ' + className}
                role="status"
                aria-label={ariaLabel}
            >
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={
                            'w-full h-12 bg-slate-800 rounded animate-pulse ' +
                            itemClassName
                        }
                    />
                ))}
            </div>
        );
    }

    if (layout === 'inline') {
        return (
            <div
                className={'flex gap-3 items-center flex-wrap ' + className}
                role="status"
                aria-label={ariaLabel}
            >
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={
                            'h-6 bg-slate-800 rounded w-24 animate-pulse ' +
                            itemClassName
                        }
                    />
                ))}
            </div>
        );
    }

    // default: grid
    return (
        <div
            className={`grid gap-4 md:gap-6 ${gridColsClass(columns)} ${className}`}
            role="status"
            aria-label={ariaLabel}
        >
            {items.map((_, i) => (
                <article
                    key={i}
                    className={`relative bg-gradient-to-b from-[#0f0b1a] to-[#171026] rounded-xl overflow-hidden text-white w-full animate-pulse ${
                        itemClassName || 'sm:w-72 md:w-80'
                    }`}
                >
                    <div className="relative h-44 bg-[#0d0a16] flex items-center justify-center" />
                    <div className="p-4 flex flex-col gap-2">
                        <div className="h-4 bg-[#1b1f2b] rounded w-1/3" />
                        <div className="h-6 bg-[#11121a] rounded w-3/4" />
                        <div className="h-4 bg-[#0f1724] rounded w-full" />
                        <div className="mt-2 flex items-center justify-between">
                            <div className="h-6 bg-[#0b1220] rounded w-24" />
                            <div className="h-8 w-20 bg-[#0b1220] rounded" />
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
