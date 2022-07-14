import { HttpStatus } from '@nestjs/common';
import { RequestQueryBuilder } from '../../crud-request';
import { isString, objKeys } from '../../util';
import { MergedCrudOptions, ParamsOptions } from '../interfaces';
import { BaseRouteName } from '../types';
import { safeRequire } from '../util';
import { R } from './reflection.helper';
const pluralize = require('pluralize');

export const swagger = safeRequire('@nestjs/swagger', () =>
  require('@nestjs/swagger')
);
export const swaggerConst = safeRequire('@nestjs/swagger/dist/constants', () =>
  require('@nestjs/swagger/dist/constants')
);
export const swaggerPkgJson = safeRequire('@nestjs/swagger/package.json', () =>
  require('@nestjs/swagger/package.json')
);

export class Swagger {
  static operationsMap(modelName): { [key in BaseRouteName]: string } {
    return {
      getManyBase: `Retrieve multiple ${pluralize(modelName)}`,
      getOneBase: `Retrieve a single ${modelName}`,
      createManyBase: `Create multiple ${pluralize(modelName)}`,
      createOneBase: `Create a single ${modelName}`,
      updateOneBase: `Update a single ${modelName}`,
      replaceOneBase: `Replace a single ${modelName}`,
      deleteOneBase: `Delete a single ${modelName}`,
      recoverOneBase: `Recover one ${modelName}`,
    };
  }

  static setOperation(metadata: any, func: Function) {
    if (swaggerConst) {
      R.set(swaggerConst.DECORATORS.API_OPERATION, metadata, func);
    }
  }

  static setParams(metadata: any, func: Function) {
    if (swaggerConst) {
      R.set(swaggerConst.DECORATORS.API_PARAMETERS, metadata, func);
    }
  }

  static setExtraModels(swaggerModels: any) {
    if (swaggerConst) {
      const meta = Swagger.getExtraModels(swaggerModels.get);
      const models: any[] = [
        ...meta,
        ...objKeys(swaggerModels)
          .map((name) => swaggerModels[name])
          .filter((one) => one && one.name !== swaggerModels.get.name),
      ];
      R.set(
        swaggerConst.DECORATORS.API_EXTRA_MODELS,
        models,
        swaggerModels.get
      );
    }
  }

  static setResponseOk(metadata: any, func: Function) {
    if (swaggerConst) {
      R.set(swaggerConst.DECORATORS.API_RESPONSE, metadata, func);
    }
  }

  static getOperation(func: Function): any {
    return swaggerConst
      ? R.get(swaggerConst.DECORATORS.API_OPERATION, func) || {}
      : {};
  }

  static getParams(func: Function): any[] {
    return swaggerConst
      ? R.get(swaggerConst.DECORATORS.API_PARAMETERS, func) || []
      : [];
  }

  static getExtraModels(target: any): any[] {
    return swaggerConst
      ? R.get(swaggerConst.DECORATORS.API_EXTRA_MODELS, target) || []
      : [];
  }

  static getResponseOk(func: Function): any {
    return swaggerConst
      ? R.get(swaggerConst.DECORATORS.API_RESPONSE, func) || {}
      : {};
  }

  static createResponseMeta(
    name: BaseRouteName,
    options: MergedCrudOptions,
    swaggerModels: any
  ): any {
    if (swagger) {
      const { routes, query } = options;
      const oldVersion = Swagger.getSwaggerVersion() < 4;

      switch (name) {
        case 'getOneBase':
          return {
            [HttpStatus.OK]: {
              description: 'Get one base response',
              type: swaggerModels.get,
            },
          };
        case 'getManyBase':
          if (oldVersion) {
            return {
              [HttpStatus.OK]: {
                type: swaggerModels.getMany,
              },
            };
          }

          return {
            [HttpStatus.OK]: query.alwaysPaginate
              ? {
                  description: 'Get paginated response',
                  type: swaggerModels.getMany,
                }
              : {
                  description: 'Get many base response',
                  schema: {
                    oneOf: [
                      {
                        $ref: swagger.getSchemaPath(swaggerModels.getMany.name),
                      },
                      {
                        type: 'array',
                        items: {
                          $ref: swagger.getSchemaPath(swaggerModels.get.name),
                        },
                      },
                    ],
                  },
                },
          };
        case 'createOneBase':
          if (oldVersion) {
            return {
              [HttpStatus.OK]: {
                type: swaggerModels.create,
              },
            };
          }

          return {
            [HttpStatus.CREATED]: {
              description: 'Get create one base response',
              schema: {
                $ref: swagger.getSchemaPath(swaggerModels.create.name),
              },
            },
          };
        case 'createManyBase':
          if (oldVersion) {
            return {
              [HttpStatus.OK]: {
                type: swaggerModels.create,
                isArray: true,
              },
            };
          }

          return {
            [HttpStatus.CREATED]: swaggerModels.createMany
              ? {
                  description: 'Get create many base response',
                  schema: {
                    $ref: swagger.getSchemaPath(swaggerModels.createMany.name),
                  },
                }
              : {
                  description: 'Get create many base response',
                  schema: {
                    type: 'array',
                    items: {
                      $ref: swagger.getSchemaPath(swaggerModels.create.name),
                    },
                  },
                },
          };
        case 'deleteOneBase':
          if (oldVersion) {
            return {
              [HttpStatus.OK]: routes.deleteOneBase.returnDeleted
                ? {
                    type: swaggerModels.delete,
                  }
                : {},
            };
          }
          return {
            [HttpStatus.OK]: routes.deleteOneBase.returnDeleted
              ? {
                  description: 'Delete one base response',
                  schema: {
                    $ref: swagger.getSchemaPath(swaggerModels.delete.name),
                  },
                }
              : {
                  description: 'Delete one base response',
                },
          };
        case 'recoverOneBase':
          if (oldVersion) {
            return {
              [HttpStatus.OK]: routes.recoverOneBase.returnRecovered
                ? {
                    type: swaggerModels.delete,
                  }
                : {},
            };
          }
          return {
            [HttpStatus.OK]: routes.recoverOneBase.returnRecovered
              ? {
                  description: 'Recover one base response',
                  schema: {
                    $ref: swagger.getSchemaPath(swaggerModels.recover.name),
                  },
                }
              : {
                  description: 'Recover one base response',
                },
          };
        default:
          const dto = swaggerModels[name.split('OneBase')[0]];

          if (oldVersion) {
            return {
              [HttpStatus.OK]: {
                type: dto,
              },
            };
          }

          return {
            [HttpStatus.OK]: {
              description: 'Response',
              schema: { $ref: swagger.getSchemaPath(dto.name) },
            },
          };
      }
    } else {
      return {};
    }
  }

  static createPathParamsMeta(options: ParamsOptions): any[] {
    return swaggerConst
      ? objKeys(options).map((param) => ({
          name: param,
          required: true,
          in: 'path',
          type: options[param].type === 'number' ? Number : String,
          enum: options[param].enum
            ? Object.values(options[param].enum)
            : undefined,
        }))
      : [];
  }

  static createQueryParamsMeta(
    name: BaseRouteName,
    options: MergedCrudOptions
  ) {
    if (!swaggerConst) {
      return [];
    }

    const {
      delim: d,
      delimStr: coma,
      fields,
      search,
      filter,
      or,
      join,
      sort,
      limit,
      offset,
      page,
      cache,
      includeDeleted,
    } = Swagger.getQueryParamsNames();
    const oldVersion = Swagger.getSwaggerVersion() < 4;
    // const docsLink = (a: string) =>
    //   `<a href="https://github.com/rewiko/crud/wiki/Requests#${a}" target="_blank">Docs</a>`;

    const searchTermMetaBase = {
      name: 'searchTerm',
      description: `
      Search term portion of data. Example:
      ___________________________________
      
      ?searchTerm=Auuntoo
      `,
      required: false,
      in: 'query',
    };
    const searchTermMeta = oldVersion
      ? { ...searchTermMetaBase, type: 'string' }
      : { ...searchTermMetaBase, schema: { type: 'string' } };

    const fieldsMetaBase = {
      name: fields,
      description: `
      Selects fields. Example:
      ________________________

      ?fields=email,name
      `,
      required: false,
      in: 'query',
    };
    const fieldsMeta = oldVersion
      ? {
          ...fieldsMetaBase,
          type: 'array',
          items: {
            type: 'string',
          },
          collectionFormat: 'csv',
        }
      : {
          ...fieldsMetaBase,
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          style: 'form',
          explode: false,
        };

    const searchMetaBase = {
      name: search,
      description: `
      Adds search condition. Example:
      _______________________________

      ?s={"name": "Aunto"}
      ?s={"name": {"$or": {"$isnull": true, "$eq": "Aunto"}}}
      ?s={"$and": [{"isActive": true}, {"createdAt": {"$ne": "2008-10-01T17:04:32"}}]}
      ?s={"isActive": true, "createdAt": {"$ne": "2008-10-01T17:04:32"}}
      ?s={"$or": [{"isActive": false}, {"updatedAt": {"$notnull": true}}]}
      
      Available search conditions in the docs.
      ________________________________________

      $eq (=, equal)
      $ne (!=, not equal)
      $gt (>, greater than)
      $lt (<, lower that)
      $gte (>=, greater than or equal)
      $lte (<=, lower than or equal)
      $starts (LIKE val%, starts with)
      $ends (LIKE %val, ends with)
      $cont (LIKE %val%, contains)
      $excl (NOT LIKE %val%, not contains)
      $in (IN, in range, accepts multiple values)
      $notin (NOT IN, not in range, accepts multiple values)
      $isnull (IS NULL, is NULL, doesn't accept value)
      $notnull (IS NOT NULL, not NULL, doesn't accept value)
      $between (BETWEEN, between, accepts two values)
      $eqL (LOWER(field) =, equal)
      $neL (LOWER(field) !=, not equal)
      $startsL (LIKE|ILIKE val%)
      $endsL (LIKE|ILIKE %val, ends with)
      $contL (LIKE|ILIKE %val%, contains)
      $exclL (NOT LIKE|ILIKE %val%, not contains)
      $inL (LOWER(field) IN, in range, accepts multiple values)
      $notinL (LOWER(field) NOT IN, not in range, accepts multiple values)
      `,
      required: false,
      in: 'query',
    };
    const searchMeta = oldVersion
      ? { ...searchMetaBase, type: 'string' }
      : { ...searchMetaBase, schema: { type: 'string' } };

    const filterMetaBase = {
      name: filter,
      description: `
      Adds filter condition. Example:
      _______________________________
      
      ?filter=role||$eq|| Customer&filter=name||$cont||Zahid
      `,
      required: false,
      in: 'query',
    };
    const filterMeta = oldVersion
      ? {
          ...filterMetaBase,
          items: {
            type: 'string',
          },
          type: 'array',
          collectionFormat: 'multi',
        }
      : {
          ...filterMetaBase,
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          style: 'form',
          explode: true,
        };

    const orMetaBase = {
      name: or,
      description: `Adds OR condition. `,
      required: false,
      in: 'query',
    };
    const orMeta = oldVersion
      ? {
          ...orMetaBase,
          items: {
            type: 'string',
          },
          type: 'array',
          collectionFormat: 'multi',
        }
      : {
          ...orMetaBase,
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          style: 'form',
          explode: true,
        };

    const sortMetaBase = {
      name: sort,
      description: `
      Adds sort by field. Example:
      ____________________________

      ?sort=name,ASC
      ?sort=name,ASC&sort=id,DESC
      `,
      required: false,
      in: 'query',
    };
    const sortMeta = oldVersion
      ? {
          ...sortMetaBase,
          items: {
            type: 'string',
          },
          type: 'array',
          collectionFormat: 'multi',
        }
      : {
          ...sortMetaBase,
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          style: 'form',
          explode: true,
        };

    const joinMetaBase = {
      name: join,
      description: `Adds relational resources. `,
      required: false,
      in: 'query',
    };
    const joinMeta = oldVersion
      ? {
          ...joinMetaBase,
          items: {
            type: 'string',
          },
          type: 'array',
          collectionFormat: 'multi',
        }
      : {
          ...joinMetaBase,
          schema: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          style: 'form',
          explode: true,
        };

    const limitMetaBase = {
      name: limit,
      description: `
      Limit amount of data. Example:
      ___________________________________
      
      ?limit=10
      `,
      required: false,
      in: 'query',
    };
    const limitMeta = oldVersion
      ? { ...limitMetaBase, type: 'integer' }
      : { ...limitMetaBase, schema: { type: 'integer' } };

    const offsetMetaBase = {
      name: offset,
      description: `Offset amount of resources. `,
      required: false,
      in: 'query',
    };
    const offsetMeta = oldVersion
      ? { ...offsetMetaBase, type: 'integer' }
      : { ...offsetMetaBase, schema: { type: 'integer' } };

    const pageMetaBase = {
      name: page,
      description: `
      Page portion of data. Example:
      ___________________________________
      
      ?page=1
      `,
      required: false,
      in: 'query',
    };
    const pageMeta = oldVersion
      ? { ...pageMetaBase, type: 'integer' }
      : { ...pageMetaBase, schema: { type: 'integer' } };

    const cacheMetaBase = {
      name: cache,
      description: `Reset cache (if was enabled). `,
      required: false,
      in: 'query',
    };
    const cacheMeta = oldVersion
      ? {
          ...cacheMetaBase,
          type: 'integer',
          minimum: 0,
          maximum: 1,
        }
      : {
          ...cacheMetaBase,
          schema: { type: 'integer', minimum: 0, maximum: 1 },
        };

    const includeDeletedMetaBase = {
      name: includeDeleted,
      description: `Include deleted. `,
      required: false,
      in: 'query',
    };
    const includeDeletedMeta = oldVersion
      ? {
          ...includeDeletedMetaBase,
          type: 'integer',
          minimum: 0,
          maximum: 1,
        }
      : {
          ...includeDeletedMetaBase,
          schema: { type: 'integer', minimum: 0, maximum: 1 },
        };

    switch (name) {
      case 'getManyBase':
        return options.query.softDelete
          ? [
              searchTermMeta,
              fieldsMeta,
              searchMeta,
              filterMeta,
              // orMeta,
              sortMeta,
              // joinMeta,
              limitMeta,
              // offsetMeta,
              pageMeta,
              // cacheMeta,
              includeDeletedMeta,
            ]
          : [
              searchTermMeta,

              fieldsMeta,
              searchMeta,
              filterMeta,
              // orMeta,
              sortMeta,
              // joinMeta,
              limitMeta,
              // offsetMeta,
              pageMeta,
              // cacheMeta,
            ];
      case 'getOneBase':
        return options.query.softDelete
          ? [
              fieldsMeta,
              // joinMeta,
              // cacheMeta,
              includeDeletedMeta,
            ]
          : [
              fieldsMeta,
              // joinMeta,
              // cacheMeta
            ];
      default:
        return [];
    }
  }

  static getQueryParamsNames() {
    const qbOptions = RequestQueryBuilder.getOptions();
    const name = (n) => {
      const selected = qbOptions.paramNamesMap[n];
      return isString(selected) ? selected : selected[0];
    };

    return {
      delim: qbOptions.delim,
      delimStr: qbOptions.delimStr,
      fields: name('fields'),
      search: name('search'),
      filter: name('filter'),
      or: name('or'),
      join: name('join'),
      sort: name('sort'),
      limit: name('limit'),
      offset: name('offset'),
      page: name('page'),
      cache: name('cache'),
      includeDeleted: name('includeDeleted'),
    };
  }

  private static getSwaggerVersion(): number {
    return swaggerPkgJson ? parseInt(swaggerPkgJson.version[0], 10) : 3;
  }
}

// tslint:disable-next-line:ban-types
export function ApiProperty(options?: any): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (swagger) {
      // tslint:disable-next-line
      const ApiPropertyDecorator =
        swagger.ApiProperty || swagger.ApiModelProperty;
      // tslint:disable-next-line
      ApiPropertyDecorator(options)(target, propertyKey);
    }
  };
}
