import { ErrorMetadata } from "../../types/ErrorMetadata";
import { AppError } from "./app.error";

export class UnauthorizedError extends AppError {
    constructor(message: string, metadata: ErrorMetadata = {}) {
        super(message, {
            statusCode: 401,
            code: 'UNAUTHORIZED',
            ...metadata,
        });
        
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
        this.name = 'UnauthorizedError';
    }
}
