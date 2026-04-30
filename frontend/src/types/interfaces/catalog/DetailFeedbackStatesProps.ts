import { TFunction } from 'i18next';

export interface DetailErrorStateProps {
    error: string;
    onRetry: () => void;
    onBack: () => void;
    t: TFunction;
}

export interface DetailStateProps {
    t: TFunction;
}
