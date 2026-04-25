import { ProductStatus } from '../enum/ProductStatus';
import { Schema } from './schema.types';
import { isUuid } from './helpers';

export const productIdParamSchema: Schema = {
    id: {
        type: 'string',
        required: true,
        validate: (value) => (isUuid(value) ? null : 'id doit etre un UUID valide'),
    },
};

export const productListQuerySchema: Schema = {
    search: { type: 'string' },
    category_id: {
        type: 'string',
        validate: (value) => (isUuid(value) ? null : 'category_id doit etre un UUID valide'),
    },
    is_service: { type: 'boolean', coerce: true },
    status: {
        type: 'string',
        enum: Object.values(ProductStatus),
    },
};

export const createSaasSchema: Schema = {
    category_id: {
        type: 'string',
        required: true,
        validate: (value) => (isUuid(value) ? null : 'category_id doit etre un UUID valide'),
    },
    name: {
        type: 'string',
        required: true,
        validate: (value) => (String(value).trim().length >= 2 ? null : 'name doit contenir au moins 2 caracteres'),
    },
    description: { type: 'string' },
    price: {
        type: 'number',
        required: true,
        coerce: true,
        validate: (value) => (Number(value) >= 0 ? null : 'price doit etre positif'),
    },
    duration: {
        type: 'number',
        required: true,
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) > 0 ? null : 'duration doit etre un entier strictement positif'),
    },
    priority: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) >= 0 ? null : 'priority doit etre un entier positif'),
    },
    status: {
        type: 'string',
        enum: Object.values(ProductStatus),
    },
};

export const createPhysicalSchema: Schema = {
    category_id: {
        type: 'string',
        required: true,
        validate: (value) => (isUuid(value) ? null : 'category_id doit etre un UUID valide'),
    },
    name: {
        type: 'string',
        required: true,
        validate: (value) => (String(value).trim().length >= 2 ? null : 'name doit contenir au moins 2 caracteres'),
    },
    description: { type: 'string' },
    price: {
        type: 'number',
        required: true,
        coerce: true,
        validate: (value) => (Number(value) >= 0 ? null : 'price doit etre positif'),
    },
    stock: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) >= 0 ? null : 'stock doit etre un entier positif'),
    },
    priority: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) >= 0 ? null : 'priority doit etre un entier positif'),
    },
    status: {
        type: 'string',
        enum: Object.values(ProductStatus),
    },
};

export const updateProductSchema: Schema = {
    category_id: {
        type: 'string',
        validate: (value) => (isUuid(value) ? null : 'category_id doit etre un UUID valide'),
    },
    name: {
        type: 'string',
        validate: (value) => (String(value).trim().length >= 2 ? null : 'name doit contenir au moins 2 caracteres'),
    },
    description: { type: 'string' },
    price: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number(value) >= 0 ? null : 'price doit etre positif'),
    },
    stock: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) >= 0 ? null : 'stock doit etre un entier positif'),
    },
    duration: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) > 0 ? null : 'duration doit etre un entier strictement positif'),
    },
    priority: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) >= 0 ? null : 'priority doit etre un entier positif'),
    },
    status: {
        type: 'string',
        enum: Object.values(ProductStatus),
    },
};

export const updateStockSchema: Schema = {
    operation: {
        type: 'string',
        required: true,
        enum: ['set', 'increment', 'decrement'],
    },
    quantity: {
        type: 'number',
        required: true,
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) >= 0 ? null : 'quantity doit etre un entier positif'),
    },
};

export const updateProductImageSchema: Schema = {
    image_base64: {
        type: 'string',
        required: true,
        validate: (value) => (String(value).trim().length > 0 ? null : 'image_base64 est requis'),
    },
    alt_text: {
        type: 'string',
    },
};

export const maintenanceSchema: Schema = {
    maintenance: {
        type: 'boolean',
        required: true,
        coerce: true,
    },
};

export const prioritySchema: Schema = {
    priority: {
        type: 'number',
        required: true,
        coerce: true,
        validate: (value) => (Number.isInteger(value) && Number(value) >= 0 ? null : 'priority doit etre un entier positif'),
    },
};

export const reorderDisplayPrioritySchema: Schema = {
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
