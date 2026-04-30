export type SupportedType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export type FieldRule = {
    type: SupportedType;
    required?: boolean;
    coerce?: boolean;
    enum?: readonly unknown[];
    validate?: (value: unknown) => string | null;
    parse?: (value: unknown) => unknown;
};

export type Schema = Record<string, FieldRule>;

export type ValidationResult<T> = {
    valid: boolean;
    errors: string[];
    data?: T;
};
