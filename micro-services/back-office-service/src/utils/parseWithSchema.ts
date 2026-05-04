import { HttpError } from '../common/httpError';
import { Schema } from '../schemas/schema.types';
import { validate } from '../schemas/validator';

export default function parseWithSchema<T>(schema: Schema, data: Record<string, unknown>): T {
    const result = validate<T>(schema, data);

    if (!result.valid || !result.data)
        throw new HttpError(400, result.errors.join(', '));

    return result.data;
}