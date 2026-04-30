import { Schema } from '../schemas/schema.types';

export type ValidatorSchemaInput = {
    body?: Schema;
    query?: Schema;
    params?: Schema;
};