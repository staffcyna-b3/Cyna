import { PromotionType } from '../enum/PromotionType';
import { Schema } from './schema.types';
import { isUuid } from './helpers';

export const promotionIdParamSchema: Schema = {
    id: {
        type: 'string',
        required: true,
        validate: (value) => (isUuid(value) ? null : 'id doit etre un UUID valide'),
    },
};

export const productIdParamSchema: Schema = {
    productId: {
        type: 'string',
        required: true,
        validate: (value) => (isUuid(value) ? null : 'productId doit etre un UUID valide'),
    },
};

export const createPromotionSchema: Schema = {
    code: {
        type: 'string',
        required: true,
        validate: (value) => (String(value).trim().length >= 3 ? null : 'code doit contenir au moins 3 caracteres'),
    },
    discount_type: {
        type: 'string',
        required: true,
        enum: Object.values(PromotionType),
    },
    discount_value: {
        type: 'number',
        required: true,
        coerce: true,
        validate: (value) => (Number(value) > 0 ? null : 'discount_value doit etre strictement positif'),
    },
    active: {
        type: 'boolean',
        coerce: true,
    },
    product_ids: {
        type: 'array',
        validate: (value) => {
            const rows = value as unknown[];
            for (let i = 0; i < rows.length; i += 1) {
                if (typeof rows[i] !== 'string' || !isUuid(rows[i])) {
                    return `product_ids[${i}] doit etre un UUID valide`;
                }
            }
            return null;
        },
    },
};

export const updatePromotionSchema: Schema = {
    code: {
        type: 'string',
        validate: (value) => (String(value).trim().length >= 3 ? null : 'code doit contenir au moins 3 caracteres'),
    },
    discount_type: {
        type: 'string',
        enum: Object.values(PromotionType),
    },
    discount_value: {
        type: 'number',
        coerce: true,
        validate: (value) => (Number(value) > 0 ? null : 'discount_value doit etre strictement positif'),
    },
    active: {
        type: 'boolean',
        coerce: true,
    },
};

export const setActiveSchema: Schema = {
    active: {
        type: 'boolean',
        required: true,
        coerce: true,
    },
};

export const promotionProductIdsSchema: Schema = {
    product_ids: {
        type: 'array',
        required: true,
        validate: (value) => {
            const rows = value as unknown[];
            for (let i = 0; i < rows.length; i += 1) {
                if (typeof rows[i] !== 'string' || !isUuid(rows[i])) {
                    return `product_ids[${i}] doit etre un UUID valide`;
                }
            }
            return null;
        },
        parse: (value) => (value as string[]).map((row) => row.trim()),
    },
};
