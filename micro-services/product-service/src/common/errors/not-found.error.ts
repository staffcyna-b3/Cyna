import { ErrorMetadata } from "../../types/ErrorMetadata";
import { AppError } from "./app.error";

export class NotFoundError extends AppError {
    constructor(message: string, metadata: ErrorMetadata = {}) {
        super(message, {
            statusCode: 404,
            code: 'NOT_FOUND',
            ...metadata,
        });

        Object.setPrototypeOf(this, NotFoundError.prototype);
        this.name = 'NotFoundError';
    }
}
