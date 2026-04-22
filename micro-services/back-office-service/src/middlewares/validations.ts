import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../common/httpError';
import { Logger } from '../common/logger';
import { Schema } from '../schemas/schema.types';
import parseWithSchema from '../utils/parseWithSchema';
import { RequestBodySchema } from '../types/RequestBodySchema';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function summarizeValue(value: unknown) {
    if (Array.isArray(value)) {
        return { type: 'array', length: value.length };
    }

    if (isRecord(value)) {
        return { type: 'object', keys: Object.keys(value) };
    }

    return value;
}

function replaceRecordContent(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
) {
    for (const key of Object.keys(target)) {
        delete target[key];
    }

    Object.assign(target, source);
}

export default function validateRequestBody<T>(schema: unknown, body: unknown): T {
    if (!isRecord(schema)) {
        throw new HttpError(400, 'Schema de validation invalide');
    }

    if (!isRecord(body)) {
        throw new HttpError(400, 'Le body de la requete est invalide');
    }

    const requestSchema = schema as RequestBodySchema;
    const normalizedBody: Record<string, unknown> = { ...body };
    const nullableValues: Record<string, null> = {};
    const missingErrors: string[] = [];

    for (const key of Object.keys(requestSchema)) {
        const rule = requestSchema[key];

        if (!rule || typeof rule !== 'object' || !('type' in rule)) {
            throw new HttpError(400, `Schema invalide pour le champ "${key}"`);
        }

        const required = rule.required === true;
        const nullable = rule.nullable ?? true;
        const value = body[key];
        const defaultMissingMessage = `${key} n'est pas renseigne`;
        const missingMessage = rule.errorMessage ?? defaultMissingMessage;

        if (value === undefined) {
            if (required) {
                missingErrors.push(missingMessage);
            }
            continue;
        }

        if (value === null) {
            if (!nullable) {
                missingErrors.push(missingMessage);
                continue;
            }

            nullableValues[key] = null;
            delete normalizedBody[key];
        }
    }

    if (missingErrors.length > 0) {
        throw new HttpError(400, missingErrors.join(', '));
    }

    const normalizedSchema: RequestBodySchema = {};
    for (const key of Object.keys(requestSchema)) {
        const rule = requestSchema[key];
        normalizedSchema[key] = {
            ...rule,
            required: false,
        };
    }

    const parsedBody = parseWithSchema<T>(
        normalizedSchema,
        normalizedBody as Record<string, unknown>,
    );

    if (!isRecord(parsedBody)) {
        return parsedBody;
    }

    return {
        ...parsedBody,
        ...nullableValues,
    } as T;
}

export function validateBody(schema: unknown) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = validateRequestBody(schema, req.body);
            return next();
        } catch (error: unknown) {
            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}

type ValidatorSchemaInput = {
    body?: Schema;
    query?: Schema;
    params?: Schema;
};

export function validatorSchema({ body, query, params }: ValidatorSchemaInput) {
    return (req: Request, res: Response, next: NextFunction) => {
        let failedAt: 'query' | 'params' | 'body' | 'unknown' = 'unknown';

        try {
            if (query) {
                failedAt = 'query';
                const parsedQuery = parseWithSchema<Record<string, unknown>>(
                    query,
                    req.query as unknown as Record<string, unknown>,
                );

                if (isRecord(req.query)) {
                    replaceRecordContent(req.query, parsedQuery);
                }
            }

            if (params) {
                failedAt = 'params';
                const parsedParams = parseWithSchema<Record<string, unknown>>(
                    params,
                    req.params as unknown as Record<string, unknown>,
                );

                if (isRecord(req.params)) {
                    replaceRecordContent(req.params, parsedParams);
                }
            }

            if (body) {
                failedAt = 'body';
                req.body = validateRequestBody(body, req.body);
            }

            return next();
        } catch (error: unknown) {
            Logger.error('validatorSchema:failed', {
                method: req.method,
                path: req.originalUrl,
                failedAt,
                message: error instanceof Error ? error.message : String(error),
                input: {
                    query: summarizeValue(req.query),
                    params: summarizeValue(req.params),
                    body: summarizeValue(req.body),
                },
            });

            if (error instanceof HttpError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}
