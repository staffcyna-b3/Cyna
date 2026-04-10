export interface ErrorMetadata {
    statusCode?: number;
    code?: string;
    context?: Record<string, any>;
    originalError?: Error;
}