import { Schema } from './schema.types';

export const getIntentParamsSchema: Schema = {
    id: {
        type: 'string',
        required: true,
        nullable: false,
        errorMessage: 'Identifiant payment intent invalide',
    },
};
