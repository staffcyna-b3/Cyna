
import { RequestTypes } from "../types/enums/RequestTypes";
import { RequestOptions } from "../types/interfaces/RequestOptions";

export class AbstractApi {
    private baseUrl: string;
    private isRefreshing = false;
    private refreshPromise: Promise<boolean> | null = null;

    constructor() {
        // if (!process.env.PUBLIC_API_DOMAIN) {
        //     throw new Error('API_DOMAIN not defined in env');
        // }
        //     const proc =
        //         typeof process !== "undefined"
        //             ? (process as unknown as { env?: { PUBLIC_API_DOMAIN?: string } })
        //             : undefined;

        //     const meta =
        //         typeof import.meta !== "undefined"
        //             ? (import.meta as unknown as { env?: { PUBLIC_API_DOMAIN?: string; VITE_PUBLIC_API_DOMAIN?: string } })
        //             : undefined;

        //     const envDomain = proc?.env?.PUBLIC_API_DOMAIN || meta?.env?.PUBLIC_API_DOMAIN || meta?.env?.VITE_PUBLIC_API_DOMAIN || "";

        //     if (!envDomain) {
        //         console.warn("PUBLIC_API_DOMAIN not defined in env; using relative URLs");
        //     }

            this.baseUrl = "http://localhost:3000/api";
    }

    // private async refreshToken(): Promise<boolean> {
    //     if (this.isRefreshing) {
    //         return this.refreshPromise || false;
    //     }

    //     this.isRefreshing = true;

    //     this.refreshPromise = (async () => {
    //         try {
    //             const res = await fetch(`${this.baseUrl}/auth/refresh`, {
    //                 method: 'POST',
    //                 credentials: 'include',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             });

    //             if (!res.ok) {
    //                 this.authStore.logout();
    //                 return false;
    //             }

    //             return true;
    //         } catch (error) {
    //             console.error('Token refresh failed:', error);
    //             this.authStore.logout();
    //             return false;
    //         } finally {
    //             this.isRefreshing = false;
    //             this.refreshPromise = null;
    //         }
    //     })();

    //     return this.refreshPromise;
    // }

    private async request<T = unknown>(
        path: string,
        method: RequestTypes,
        options: RequestOptions = {},
        // retry = true
    ): Promise<T> {
        const { body, headers } = options;

        const fetchOptions: RequestInit = {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        };

        const url = `${this.baseUrl}${path}`;
        const res = await fetch(url, fetchOptions);

        // if (res.status === 401 && retry) {
        //     const refreshed = await this.refreshToken();

        //     if (refreshed) {
        //         return this.request(path, method, options, false);
        //     } else {
        //         this.authStore.logout();
        //         throw new Error('Session expired. Please login again.');
        //     }
        // }

        if (!res.ok) {
            let errorData: unknown = null;
            try {
                errorData = await res.json();
            } catch {
                errorData = null;
            }

            let msg = `HTTP ${res.status}: ${res.statusText}`;
            if (errorData && typeof errorData === "object") {
                const ed = errorData as Record<string, unknown>;
                if (typeof ed["message"] === "string") {
                    msg = ed["message"] as string;
                }
            }

            throw new Error(msg);
        }

        return (await res.json().catch(() => null)) as unknown as T;
    }

    get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(path, RequestTypes.GET, options);
    }

    post<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(path, RequestTypes.POST, options);
    }

    put<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(path, RequestTypes.PUT, options);
    }

    delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(path, RequestTypes.DELETE, options);
    }
}
