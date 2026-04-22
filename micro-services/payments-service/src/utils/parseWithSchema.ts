import { HttpError } from '../common/httpError';
import { Schema } from '../schemas/schema.types';
import { RequestBodySchema } from '../types/RequestBodySchema';

function checkType(value: unknown, type: string): boolean {
    switch (type) {
        case 'string':  return typeof value === 'string';
        case 'number':  return typeof value === 'number' && !isNaN(value as number);
        case 'integer': return typeof value === 'number' && Number.isInteger(value);
        case 'boolean': return typeof value === 'boolean';
        case 'array':   return Array.isArray(value);
        case 'object':  return typeof value === 'object' && value !== null && !Array.isArray(value);
        default:        return true;
    }
}

export default function parseWithSchema<T>(
    schema: Schema | RequestBodySchema,
    data: Record<string, unknown>,
): T {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(schema)) {
        const rule = schema[key];

        if (!rule) continue;

        let value = data[key];

        if (value === undefined || value === null) {
            result[key] = value;
            continue;
        }

        if (rule.coerce) {
            if (rule.type === 'number' || rule.type === 'integer') {
                const coerced = Number(value);
                if (!isNaN(coerced)) {
                    value = rule.type === 'integer' ? Math.trunc(coerced) : coerced;
                }
            } else if (rule.type === 'boolean') {
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
            } else if (rule.type === 'string') {
                value = String(value);
            }
        }

        if (!checkType(value, rule.type)) {
            const msg = rule.errorMessage ?? `${key} doit être de type ${rule.type}`;
            throw new HttpError(400, msg);
        }

        if (rule.enum && !rule.enum.includes(value)) {
            const msg = rule.errorMessage ?? `${key} doit être l'une des valeurs : ${rule.enum.join(', ')}`;
            throw new HttpError(400, msg);
        }

        if (rule.validate) {
            const error = rule.validate(value);
            if (error) {
                throw new HttpError(400, error);
            }
        }

        if (rule.parse) {
            value = rule.parse(value);
        }

        result[key] = value;
    }

    return result as T;
}
