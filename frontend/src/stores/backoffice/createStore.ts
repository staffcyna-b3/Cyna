import { useSyncExternalStore } from 'react';

export type Listener = () => void;

export type StoreApi<TState> = {
    getState: () => TState;
    setState: (nextState: Partial<TState>) => void;
    subscribe: (listener: Listener) => () => void;
};

export function createStore<TState extends object>(initialState: TState): StoreApi<TState> {
    let state = initialState;
    const listeners = new Set<Listener>();

    function getState(): TState {
        return state;
    }

    function setState(nextState: Partial<TState>): void {
        state = { ...state, ...nextState };
        listeners.forEach((listener) => listener());
    }

    function subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    return { getState, setState, subscribe };
}

export function createStoreHook<TState>(store: StoreApi<TState>) {
    return function useStore(): TState {
        return useSyncExternalStore(store.subscribe, store.getState, store.getState);
    };
}
