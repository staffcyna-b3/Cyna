let accessToken: string | null = null;

export const getToken = (): string | null => accessToken;
export const setToken = (token: string): void => { accessToken = token; };
export const clearToken = (): void => { accessToken = null; };
