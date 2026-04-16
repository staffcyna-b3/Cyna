import { ArrowDown } from 'lucide-react';
import ServiceDetailLayout from '@/components/Frontoffice/layout/ServiceDetailLayout';

interface CatalogHeroProps {
    categoryName: string;
    categoryDescription: string;
    categoryAbbreviation: string;
    discoverLabel: string;
    onDiscover: () => void;
}

export default function CatalogHero({
    categoryName,
    categoryDescription,
    categoryAbbreviation,
    discoverLabel,
    onDiscover,
}: CatalogHeroProps) {
    return (
        <ServiceDetailLayout
            title={categoryName}
            description={categoryDescription}
            abbreviation={categoryAbbreviation}
        >
            <button
                type="button"
                onClick={onDiscover}
                className="group inline-flex w-full max-w-130 items-center justify-between rounded-full border border-[#4f5bff] bg-[linear-gradient(180deg,rgba(10,16,70,0.9)_0%,rgba(6,11,56,0.95)_100%)] pl-5 pr-2 py-2 text-sm font-semibold text-white shadow-[0_10px_36px_rgba(25,70,255,0.38)] transition-all duration-300 hover:border-[#7281ff] hover:shadow-[0_14px_42px_rgba(42,108,255,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b61ff]/60"
            >
                <span className="truncate pr-3">{discoverLabel}</span>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-[#7b61ff] to-[#2b6ef6] shadow-[0_4px_14px_rgba(91,107,255,0.75)] transition-transform duration-300 group-hover:translate-y-0.5">
                    <ArrowDown className="h-4 w-4" />
                </span>
            </button>
        </ServiceDetailLayout>
    );
}
