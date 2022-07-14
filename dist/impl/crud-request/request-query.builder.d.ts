import { CreateQueryParams, CustomOperators, RequestQueryBuilderOptions } from './interfaces';
import { QueryFields, QueryFilter, QueryFilterArr, QueryJoin, QueryJoinArr, QuerySort, QuerySortArr, SCondition } from './types';
export declare class RequestQueryBuilder {
    constructor();
    private static _options;
    private paramNames;
    queryObject: {
        [key: string]: any;
    };
    queryString: string;
    static setOptions(options: RequestQueryBuilderOptions): void;
    static getOptions(): RequestQueryBuilderOptions;
    static create(params?: CreateQueryParams, customOperators?: CustomOperators): RequestQueryBuilder;
    get options(): RequestQueryBuilderOptions;
    setParamNames(): void;
    query(encode?: boolean): string;
    select(fields: QueryFields): this;
    search(s: SCondition): this;
    setFilter(f: QueryFilter | QueryFilterArr | Array<QueryFilter | QueryFilterArr>, customOperators?: CustomOperators): this;
    setOr(f: QueryFilter | QueryFilterArr | Array<QueryFilter | QueryFilterArr>, customOperators?: CustomOperators): this;
    setJoin(j: QueryJoin | QueryJoinArr | Array<QueryJoin | QueryJoinArr>): this;
    sortBy(s: QuerySort | QuerySortArr | Array<QuerySort | QuerySortArr>): this;
    setLimit(n: number): this;
    setOffset(n: number): this;
    setPage(n: number): this;
    resetCache(): this;
    setIncludeDeleted(n: number): this;
    cond(f: QueryFilter | QueryFilterArr, cond?: 'filter' | 'or' | 'search', customOperators?: CustomOperators): string;
    private addJoin;
    private addSortBy;
    private createFromParams;
    private checkQueryObjectParam;
    private setCondition;
    private setNumeric;
}
