export declare function getEntityMetadata(entityName: string): Promise<{
    ownColumns: string[];
    relations: string[];
    searchTerms: string[];
}>;
