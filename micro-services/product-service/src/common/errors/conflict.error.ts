import { ErrorMetadata } from "../../types/ErrorMetadata";
import { AppError } from "./app.error";

export class ConflictError extends AppError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, {
        statusCode: 409,
        code: 'CONFLICT',
        ...metadata,
    });
    
    Object.setPrototypeOf(this, ConflictError.prototype);
    this.name = 'ConflictError';
  }
}
