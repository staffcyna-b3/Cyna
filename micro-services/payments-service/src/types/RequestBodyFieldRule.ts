import { SupportedType } from '../schemas/schema.types';

export type RequestBodyFieldRule = {
    type: SupportedType;
    required?: boolean;
    nullable?: boolean;
    errorMessage?: string;
    coerce?: boolean;
    enum?: readonly unknown[];
    validate?: (value: unknown) => string | null;
    parse?: (value: unknown) => unknown;
};
