import { Schema } from './schema.types';

export const createIntentSchema: Schema = {
    amount: {
        type: 'number',
        required: true,
        nullable: false,
        errorMessage: 'amount est requis et doit être un nombre',
        validate: (value) => {
            if (typeof value === 'number' && value <= 0) {
                return 'amount doit être supérieur à 0';
            }
            return null;
        },
    },
    currency: {
        type: 'string',
        required: true,
        nullable: false,
        errorMessage: 'currency est requise',
    },
    description: {
        type: 'string',
        required: false,
        nullable: true,
    },
};
