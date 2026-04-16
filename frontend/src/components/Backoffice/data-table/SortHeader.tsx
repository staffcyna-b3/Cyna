import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SortHeaderProps = {
    label: string;
    sorted: false | 'asc' | 'desc';
    onToggle: () => void;
};

export function SortHeader({ label, sorted, onToggle }: SortHeaderProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
            onClick={onToggle}
        >
            <span>{label}</span>
            <ArrowUpDown
                className={sorted ? 'ml-1.5 size-3.5 text-indigo-600' : 'ml-1.5 size-3.5 text-gray-400'}
            />
        </Button>
    );
}
