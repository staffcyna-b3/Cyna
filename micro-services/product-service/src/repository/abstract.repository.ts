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

    async getById(id: string, includes?: Includeable[]): Promise<T | null> {
            const associationsToInclude = includes || this.defaultIncludes;

            return await this.model.findByPk(id, {
                include: associationsToInclude.length > 0 ? associationsToInclude : undefined,
            });
    }

    async count(where?: WhereOptions<T>): Promise<number> {
            const effectiveWhere = where && Object.keys(where as any).length > 0 ? where : undefined;
            return await this.model.count({ where: effectiveWhere });
    }
}
