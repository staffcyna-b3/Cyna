import { ErrorMetadata } from "../../types/ErrorMetadata";
import { AppError } from "./app.error";

export class ValidationError extends AppError {
    constructor(message: string, metadata: ErrorMetadata = {}) {
        super(message, {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          ...metadata,
        });
        
        Object.setPrototypeOf(this, ValidationError.prototype);
        this.name = 'ValidationError';
    }
}
