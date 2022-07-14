export interface OperatorsOptions {
    custom?: CustomOperators;
}
export declare type CustomOperatorQuery = (field: string, param: string) => string;
export interface CustomOperators {
    [key: string]: {
        query: CustomOperatorQuery;
        params?: {
            [field: string]: any;
        };
        isArray?: boolean;
    };
}
