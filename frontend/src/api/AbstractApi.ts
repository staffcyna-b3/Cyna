import { RequestTypes } from "../types/enums/RequestTypes";
import { RequestOptions } from "../types/interfaces/RequestOptions";

export class AbstractApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.GATEWAY_API_URL || "http://localhost:3000/api";
    }


    private async request<T = unknown>(
        path: string,
        method: RequestTypes,
        options: RequestOptions = {},
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
