export function buildQueryString(payload: Record<string, unknown>): string {
    const params = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    });

    const query = params.toString();
    return query ? `?${query}` : '';
}
