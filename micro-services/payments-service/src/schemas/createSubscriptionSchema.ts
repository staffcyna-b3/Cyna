import { Schema } from './schema.types';

export const createSubscriptionSchema: Schema = {
    subscriptionItems: {
        type: 'array',
        required: true,
        nullable: false,
        errorMessage: 'subscriptionItems est requis et doit être un tableau',
        validate: (value) => {
            if (Array.isArray(value) && value.length === 0) {
                return "Au moins un item d'abonnement est requis";
            }
            return null;
        },
    },
    oneTimeAmountCents: {
        type: 'number',
        required: false,
        nullable: true,
        validate: (value) => {
            if (typeof value === 'number' && value < 0) {
                return 'oneTimeAmountCents ne peut pas être négatif';
            }
            return null;
        },
    },
    oneTimeDescription: {
        type: 'string',
        required: false,
        nullable: true,
    },
};
