import { CategoryType } from '../enum/CategoryType';
import { Schema } from './schema.types';
import { isUuid } from './helpers';

export const categoryIdParamSchema: Schema = {
    id: {
        type: 'string',
        required: true,
        validate: (value) => (isUuid(value) ? null : 'id doit etre un UUID valide'),
    },
};

export const categoryFiltersQuerySchema: Schema = {
    type: {
        type: 'string',
        enum: Object.values(CategoryType),
    },
    search: {
        type: 'string',
    },
};
