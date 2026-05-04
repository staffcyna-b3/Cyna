import { Schema, ValidationResult } from './schema.types';

function coerceValue(value: unknown, type: Schema[string]['type']): unknown {
    if (type === 'number' && typeof value === 'string' && value.trim() !== '') {
        const num = Number(value);
        return Number.isNaN(num) ? value : num;
    }

    if (type === 'boolean' && typeof value === 'string') {
        if (value === 'true') {
            return true;
        }

        if (value === 'false') {
            return false;
        }
    }

    return value;
}

function isTypeValid(value: unknown, type: Schema[string]['type']): boolean {
    if (type === 'string') {
        return typeof value === 'string';
    }

    if (type === 'number') {
        return typeof value === 'number' && Number.isFinite(value);
    }

    if (type === 'boolean') {
        return typeof value === 'boolean';
    }

    if (type === 'array') {
        return Array.isArray(value);
    }

    if (type === 'object') {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    return false;
}

function typeMessage(key: string, type: Schema[string]['type']): string {
    if (type === 'string') {
        return `${key} doit etre une string`;
    }

    if (type === 'number') {
        return `${key} doit etre un nombre`;
    }

    if (type === 'boolean') {
        return `${key} doit etre un booleen`;
    }

    if (type === 'array') {
        return `${key} doit etre un tableau`;
    }

    return `${key} doit etre un objet`;
}

export function validate<T = Record<string, unknown>>(
    schema: Schema,
    data: Record<string, unknown>
): ValidationResult<T> {
    const errors: string[] = [];
    const parsedData: Record<string, unknown> = {};

    for (const key in schema) {
        const rule = schema[key];
        const rawValue = data[key];

        if (rule.required && (rawValue === undefined || rawValue === null)) {
            errors.push(`${key} est requis`);
            continue;
        }

        if (rawValue === undefined) {
            continue;
        }

        const value = rule.coerce ? coerceValue(rawValue, rule.type) : rawValue;

        if (!isTypeValid(value, rule.type)) {
            errors.push(typeMessage(key, rule.type));
            continue;
        }

        if (rule.enum && !rule.enum.includes(value)) {
            errors.push(`${key} a une valeur invalide`);
            continue;
        }

        if (rule.validate) {
            const error = rule.validate(value);
            if (error) {
                errors.push(error);
                continue;
            }
        }

        parsedData[key] = rule.parse ? rule.parse(value) : value;
    }

    return {
        valid: errors.length === 0,
        errors,
        data: errors.length === 0 ? (parsedData as T) : undefined,
    };
}
