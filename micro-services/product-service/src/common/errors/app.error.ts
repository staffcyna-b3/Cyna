import { ErrorMetadata } from '../../types/ErrorMetadata';
import { Logger } from '../logger';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly context: Record<string, any>;
    public readonly originalError?: Error;
    public readonly timestamp: Date;

    constructor(message: string, metadata: ErrorMetadata = {}) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);

        this.name = 'AppError';
        this.statusCode = metadata.statusCode || 500;
        this.code = metadata.code || 'INTERNAL_ERROR';
        this.context = metadata.context || {};
        this.originalError = metadata.originalError;
        this.timestamp = new Date();


        Error.captureStackTrace(this, this.constructor);

        this.logError();
    }

    private logError(): void {
        const errorMeta = {
            statusCode: this.statusCode,
            code: this.code,
            context: this.context,
            stack: this.stack,
            timestamp: this.timestamp.toISOString(),
            ...(this.originalError && {
                originalError: {
                message: this.originalError.message,
                stack: this.originalError.stack,
                },
            }),
        };

        if (this.statusCode >= 500)
            Logger.error(this.message, errorMeta);
        else if (this.statusCode >= 400)
            Logger.warn(this.message, errorMeta);
        else
            Logger.info(this.message, errorMeta);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            ...(process.env.NODE_ENV === 'development' && {
                stack: this.stack,
            }),
        };
    }
}
