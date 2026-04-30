import type { TFunction } from 'i18next';

const GENERIC_TECHNICAL_MARKERS = [
    'microservice error',
    'gateway_error',
    'failed to fetch',
    'networkerror',
    'fetch failed',
    'load failed',
];

function isTechnicalErrorMessage(message: string): boolean {
    const lower = message.toLowerCase();

    if (GENERIC_TECHNICAL_MARKERS.some((marker) => lower.includes(marker))) {
        return true;
    }

    return lower.startsWith('http 5') || lower.startsWith('http 404');
}

export function getBackOfficeErrorMessage(
    t: TFunction,
    rawError: string | null | undefined,
): string | null {
    const message = rawError?.trim();

    if (!message) {
        return null;
    }

    if (!isTechnicalErrorMessage(message)) {
        return message;
    }

    return t('backoffice.errors.generic');
}
