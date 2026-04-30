import { Setter } from '@/types/Setter';

export interface FilterPanelProps {
    open: boolean;
    mode: 'filters' | 'sort';
    onClose: () => void;
    onApply: () => void;
    onApplySort: (value: string | '') => void;

    localSearch?: string;
    setLocalSearch: Setter<string | undefined>;
    localMin?: number;
    setLocalMin: Setter<number | undefined>;
    localMax?: number;
    setLocalMax: Setter<number | undefined>;
    localInStock?: boolean;
    setLocalInStock: Setter<boolean | undefined>;
    localIsService?: boolean;
    setLocalIsService: Setter<boolean | undefined>;
    localSort: string | '';
    setLocalSort: Setter<string | ''>;

    sliderMin: number;
    sliderMax: number;
}
