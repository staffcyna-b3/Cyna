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

export const reorderCategoryDisplayPrioritySchema: Schema = {
    items: {
        type: 'array',
        required: true,
        validate: (value) => {
            const rows = value as unknown[];
            if (!Array.isArray(rows) || rows.length === 0) {
                return 'items doit etre un tableau non vide';
            }

            for (let i = 0; i < rows.length; i += 1) {
                const row = rows[i] as Record<string, unknown>;
                if (!row || typeof row !== 'object') {
                    return `items[${i}] invalide`;
                }

                if (!isUuid(row.id)) {
                    return `items[${i}].id doit etre un UUID valide`;
                }

                if (!Number.isInteger(Number(row.priority)) || Number(row.priority) < 0) {
                    return `items[${i}].priority doit etre un entier positif`;
                }
            }

            return null;
        },
        parse: (value) => {
            return (value as Array<Record<string, unknown>>).map((row) => ({
                id: String(row.id),
                priority: Number(row.priority),
            }));
        },
    },
};
