import { getConnection } from 'typeorm';

export async function getEntityMetadata(entityName: string): Promise<{
  ownColumns: string[];
  relations: string[];
  searchTerms: string[];
}> {
  try {
    let entity: any = await getConnection().getMetadata(entityName);
    const searchTerms: string[] = entity.target?.SEARCH_TERMS || [];

    const ownColumns = await entity.ownColumns
      .map((column) => column.propertyName)
      .filter((colName) => colName !== 'id');

    const relations = await entity.relations.map(
      (column) => column.propertyName
    );

    relations.map((r) => {
      if (ownColumns.includes(r)) {
        const i = ownColumns.indexOf(r);
        ownColumns.splice(i, 1);
      }
    });

    return { ownColumns, relations, searchTerms };
  } catch (error) {
    throw new Error('Invalid Entity Name');
  }
}
