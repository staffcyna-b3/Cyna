import { Includeable, WhereOptions } from "sequelize";

export interface ListOptionsDto<T> {
    page?: number;
    limit?: number;
    where?: WhereOptions<T>;
    order?: any;
    include?: Includeable[];
}