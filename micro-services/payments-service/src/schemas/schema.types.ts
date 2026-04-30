export type SupportedType =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'object';

export type SchemaFieldRule = {
    type: SupportedType;
    required?: boolean;
    nullable?: boolean;
    errorMessage?: string;
    coerce?: boolean;
    enum?: readonly unknown[];
    validate?: (value: unknown) => string | null;
    parse?: (value: unknown) => unknown;
};

export type Schema = Record<string, SchemaFieldRule>;
