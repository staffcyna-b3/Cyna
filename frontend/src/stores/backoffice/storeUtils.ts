import type { StoreApi } from './createStore';

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export function setStoreLoading<TState extends { loading: boolean }>(
    store: StoreApi<TState>,
    loading: boolean,
): void {
    store.setState({ loading } as Partial<TState>);
}

export function setStoreError<TState extends { error: string | null }>(
    store: StoreApi<TState>,
    error: string | null,
): void {
    store.setState({ error } as Partial<TState>);
}
