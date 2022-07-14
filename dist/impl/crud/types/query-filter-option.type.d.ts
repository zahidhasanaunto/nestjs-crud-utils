import { QueryFilter, SCondition } from '../../crud-request';
export declare type QueryFilterFunction = (search?: SCondition, getMany?: boolean) => SCondition | void;
export declare type QueryFilterOption = QueryFilter[] | SCondition | QueryFilterFunction;
