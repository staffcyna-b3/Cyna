import { Model, ModelStatic, FindOptions, WhereOptions, Includeable, ValidationError } from 'sequelize';
import { ListOptionsDto } from '../dto/requests/ListOptions.dto';
import { AppError, NotFoundError } from '../common/errors';
import { Logger } from '../common/logger';
import { ListPromise } from '../types/ListPromise';

export abstract class AbstractRepository<T extends Model> {
    protected model: ModelStatic<T>;
    protected defaultIncludes: Includeable[] = [];

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    async list(options?: ListOptionsDto<T>): Promise<ListPromise<T>> {
        try {
            const page = options?.page || 1;
            const limit = options?.limit || 10;

            const offset = (page - 1) * limit;
            const associationsToInclude = options?.include || this.defaultIncludes;

            const findOptions: FindOptions<T> & { distinct: true } = {
                offset,
                limit,
                where: options?.where,
                order: options?.order,
                include: associationsToInclude.length > 0 ? associationsToInclude : undefined,
                distinct: true,
            };

            const { rows, count } = await this.model.findAndCountAll(findOptions);

            Logger.info(`Liste de ${this.model.name} récupérée`, {
                modelName: this.model.name,
                page,
                limit,
                totalCount: count,
                returnedCount: rows.length,
            });

            return {
                rows,
                count,
                page,
                totalPages: Math.ceil(count / limit),
            };
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;

            Logger.error(`Erreur lors de la récupération de la liste de ${this.model.name}`, {
                modelName: this.model.name,
                page: options?.page,
                limit: options?.limit,
                originalError: error instanceof Error ? error.message : String(error),
            });

            throw new AppError(
                `Erreur lors de la récupération de la liste de ${this.model.name}`,
                {
                    statusCode: 500,
                    code: 'DATABASE_ERROR',
                    context: {
                        modelName: this.model.name,
                        page: options?.page,
                        limit: options?.limit,
                    },
                    originalError: error instanceof Error ? error : undefined,
                }
            );
        }
    }

    async getById(id: string, includes?: Includeable[]): Promise<T | null> {
        try {
            const associationsToInclude = includes || this.defaultIncludes;

            const entity = await this.model.findByPk(id, {
                include: associationsToInclude.length > 0 ? associationsToInclude : undefined,
            });

            if (!entity) {
                throw new NotFoundError(
                    `${this.model.name} avec l'ID ${id} non trouvé`,
                    {
                        context: { id, modelName: this.model.name },
                    }
                );
            }

            return entity;
        } catch (error) {
            if (error instanceof AppError)
                throw error;

            Logger.error(`Erreur lors de la récupération de ${this.model.name}`, {
                id,
                modelName: this.model.name,
                originalError: error instanceof Error ? error.message : String(error),
            });

            throw new AppError(
                `Erreur lors de la récupération de ${this.model.name}`,
                {
                    statusCode: 500,
                    code: 'DATABASE_ERROR',
                    context: { id, modelName: this.model.name },
                    originalError: error instanceof Error ? error : undefined,
                }
            );
        }
    }

    async count(where?: WhereOptions<T>): Promise<number> {
        try {
            const effectiveWhere = where && Object.keys(where as any).length > 0 ? where : undefined;
            return await this.model.count({ where: effectiveWhere });
        }
        catch (error) {
            Logger.error(`Erreur lors du comptage de ${this.model.name}`, {
                modelName: this.model.name,
                originalError: error instanceof Error ? error.message : String(error),
            });

            throw new AppError(
                `Erreur lors du comptage de ${this.model.name}`,
                {
                    statusCode: 500,
                    code: 'DATABASE_ERROR',
                    context: { modelName: this.model.name },
                    originalError: error instanceof Error ? error : undefined,
                }
            );
        }
    }
}
