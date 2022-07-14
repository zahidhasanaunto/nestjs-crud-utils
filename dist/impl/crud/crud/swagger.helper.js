"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiProperty = exports.Swagger = exports.swaggerPkgJson = exports.swaggerConst = exports.swagger = void 0;
const common_1 = require("@nestjs/common");
const crud_request_1 = require("../../crud-request");
const util_1 = require("../../util");
const util_2 = require("../util");
const reflection_helper_1 = require("./reflection.helper");
const pluralize = require('pluralize');
exports.swagger = (0, util_2.safeRequire)('@nestjs/swagger', () => require('@nestjs/swagger'));
exports.swaggerConst = (0, util_2.safeRequire)('@nestjs/swagger/dist/constants', () => require('@nestjs/swagger/dist/constants'));
exports.swaggerPkgJson = (0, util_2.safeRequire)('@nestjs/swagger/package.json', () => require('@nestjs/swagger/package.json'));
class Swagger {
    static operationsMap(modelName) {
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
    static setOperation(metadata, func) {
        if (exports.swaggerConst) {
            reflection_helper_1.R.set(exports.swaggerConst.DECORATORS.API_OPERATION, metadata, func);
        }
    }
    static setParams(metadata, func) {
        if (exports.swaggerConst) {
            reflection_helper_1.R.set(exports.swaggerConst.DECORATORS.API_PARAMETERS, metadata, func);
        }
    }
    static setExtraModels(swaggerModels) {
        if (exports.swaggerConst) {
            const meta = Swagger.getExtraModels(swaggerModels.get);
            const models = [
                ...meta,
                ...(0, util_1.objKeys)(swaggerModels)
                    .map((name) => swaggerModels[name])
                    .filter((one) => one && one.name !== swaggerModels.get.name),
            ];
            reflection_helper_1.R.set(exports.swaggerConst.DECORATORS.API_EXTRA_MODELS, models, swaggerModels.get);
        }
    }
    static setResponseOk(metadata, func) {
        if (exports.swaggerConst) {
            reflection_helper_1.R.set(exports.swaggerConst.DECORATORS.API_RESPONSE, metadata, func);
        }
    }
    static getOperation(func) {
        return exports.swaggerConst
            ? reflection_helper_1.R.get(exports.swaggerConst.DECORATORS.API_OPERATION, func) || {}
            : {};
    }
    static getParams(func) {
        return exports.swaggerConst
            ? reflection_helper_1.R.get(exports.swaggerConst.DECORATORS.API_PARAMETERS, func) || []
            : [];
    }
    static getExtraModels(target) {
        return exports.swaggerConst
            ? reflection_helper_1.R.get(exports.swaggerConst.DECORATORS.API_EXTRA_MODELS, target) || []
            : [];
    }
    static getResponseOk(func) {
        return exports.swaggerConst
            ? reflection_helper_1.R.get(exports.swaggerConst.DECORATORS.API_RESPONSE, func) || {}
            : {};
    }
    static createResponseMeta(name, options, swaggerModels) {
        if (exports.swagger) {
            const { routes, query } = options;
            const oldVersion = Swagger.getSwaggerVersion() < 4;
            switch (name) {
                case 'getOneBase':
                    return {
                        [common_1.HttpStatus.OK]: {
                            description: 'Get one base response',
                            type: swaggerModels.get,
                        },
                    };
                case 'getManyBase':
                    if (oldVersion) {
                        return {
                            [common_1.HttpStatus.OK]: {
                                type: swaggerModels.getMany,
                            },
                        };
                    }
                    return {
                        [common_1.HttpStatus.OK]: query.alwaysPaginate
                            ? {
                                description: 'Get paginated response',
                                type: swaggerModels.getMany,
                            }
                            : {
                                description: 'Get many base response',
                                schema: {
                                    oneOf: [
                                        {
                                            $ref: exports.swagger.getSchemaPath(swaggerModels.getMany.name),
                                        },
                                        {
                                            type: 'array',
                                            items: {
                                                $ref: exports.swagger.getSchemaPath(swaggerModels.get.name),
                                            },
                                        },
                                    ],
                                },
                            },
                    };
                case 'createOneBase':
                    if (oldVersion) {
                        return {
                            [common_1.HttpStatus.OK]: {
                                type: swaggerModels.create,
                            },
                        };
                    }
                    return {
                        [common_1.HttpStatus.CREATED]: {
                            description: 'Get create one base response',
                            schema: {
                                $ref: exports.swagger.getSchemaPath(swaggerModels.create.name),
                            },
                        },
                    };
                case 'createManyBase':
                    if (oldVersion) {
                        return {
                            [common_1.HttpStatus.OK]: {
                                type: swaggerModels.create,
                                isArray: true,
                            },
                        };
                    }
                    return {
                        [common_1.HttpStatus.CREATED]: swaggerModels.createMany
                            ? {
                                description: 'Get create many base response',
                                schema: {
                                    $ref: exports.swagger.getSchemaPath(swaggerModels.createMany.name),
                                },
                            }
                            : {
                                description: 'Get create many base response',
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: exports.swagger.getSchemaPath(swaggerModels.create.name),
                                    },
                                },
                            },
                    };
                case 'deleteOneBase':
                    if (oldVersion) {
                        return {
                            [common_1.HttpStatus.OK]: routes.deleteOneBase.returnDeleted
                                ? {
                                    type: swaggerModels.delete,
                                }
                                : {},
                        };
                    }
                    return {
                        [common_1.HttpStatus.OK]: routes.deleteOneBase.returnDeleted
                            ? {
                                description: 'Delete one base response',
                                schema: {
                                    $ref: exports.swagger.getSchemaPath(swaggerModels.delete.name),
                                },
                            }
                            : {
                                description: 'Delete one base response',
                            },
                    };
                case 'recoverOneBase':
                    if (oldVersion) {
                        return {
                            [common_1.HttpStatus.OK]: routes.recoverOneBase.returnRecovered
                                ? {
                                    type: swaggerModels.delete,
                                }
                                : {},
                        };
                    }
                    return {
                        [common_1.HttpStatus.OK]: routes.recoverOneBase.returnRecovered
                            ? {
                                description: 'Recover one base response',
                                schema: {
                                    $ref: exports.swagger.getSchemaPath(swaggerModels.recover.name),
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
                            [common_1.HttpStatus.OK]: {
                                type: dto,
                            },
                        };
                    }
                    return {
                        [common_1.HttpStatus.OK]: {
                            description: 'Response',
                            schema: { $ref: exports.swagger.getSchemaPath(dto.name) },
                        },
                    };
            }
        }
        else {
            return {};
        }
    }
    static createPathParamsMeta(options) {
        return exports.swaggerConst
            ? (0, util_1.objKeys)(options).map((param) => ({
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
    static createQueryParamsMeta(name, options) {
        if (!exports.swaggerConst) {
            return [];
        }
        const { delim: d, delimStr: coma, fields, search, filter, or, join, sort, limit, offset, page, cache, includeDeleted, } = Swagger.getQueryParamsNames();
        const oldVersion = Swagger.getSwaggerVersion() < 4;
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
            ? Object.assign(Object.assign({}, searchTermMetaBase), { type: 'string' }) : Object.assign(Object.assign({}, searchTermMetaBase), { schema: { type: 'string' } });
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
            ? Object.assign(Object.assign({}, fieldsMetaBase), { type: 'array', items: {
                    type: 'string',
                }, collectionFormat: 'csv' }) : Object.assign(Object.assign({}, fieldsMetaBase), { schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            }, style: 'form', explode: false });
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
            ? Object.assign(Object.assign({}, searchMetaBase), { type: 'string' }) : Object.assign(Object.assign({}, searchMetaBase), { schema: { type: 'string' } });
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
            ? Object.assign(Object.assign({}, filterMetaBase), { items: {
                    type: 'string',
                }, type: 'array', collectionFormat: 'multi' }) : Object.assign(Object.assign({}, filterMetaBase), { schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            }, style: 'form', explode: true });
        const orMetaBase = {
            name: or,
            description: `Adds OR condition. `,
            required: false,
            in: 'query',
        };
        const orMeta = oldVersion
            ? Object.assign(Object.assign({}, orMetaBase), { items: {
                    type: 'string',
                }, type: 'array', collectionFormat: 'multi' }) : Object.assign(Object.assign({}, orMetaBase), { schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            }, style: 'form', explode: true });
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
            ? Object.assign(Object.assign({}, sortMetaBase), { items: {
                    type: 'string',
                }, type: 'array', collectionFormat: 'multi' }) : Object.assign(Object.assign({}, sortMetaBase), { schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            }, style: 'form', explode: true });
        const joinMetaBase = {
            name: join,
            description: `Adds relational resources. `,
            required: false,
            in: 'query',
        };
        const joinMeta = oldVersion
            ? Object.assign(Object.assign({}, joinMetaBase), { items: {
                    type: 'string',
                }, type: 'array', collectionFormat: 'multi' }) : Object.assign(Object.assign({}, joinMetaBase), { schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            }, style: 'form', explode: true });
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
            ? Object.assign(Object.assign({}, limitMetaBase), { type: 'integer' }) : Object.assign(Object.assign({}, limitMetaBase), { schema: { type: 'integer' } });
        const offsetMetaBase = {
            name: offset,
            description: `Offset amount of resources. `,
            required: false,
            in: 'query',
        };
        const offsetMeta = oldVersion
            ? Object.assign(Object.assign({}, offsetMetaBase), { type: 'integer' }) : Object.assign(Object.assign({}, offsetMetaBase), { schema: { type: 'integer' } });
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
            ? Object.assign(Object.assign({}, pageMetaBase), { type: 'integer' }) : Object.assign(Object.assign({}, pageMetaBase), { schema: { type: 'integer' } });
        const cacheMetaBase = {
            name: cache,
            description: `Reset cache (if was enabled). `,
            required: false,
            in: 'query',
        };
        const cacheMeta = oldVersion
            ? Object.assign(Object.assign({}, cacheMetaBase), { type: 'integer', minimum: 0, maximum: 1 }) : Object.assign(Object.assign({}, cacheMetaBase), { schema: { type: 'integer', minimum: 0, maximum: 1 } });
        const includeDeletedMetaBase = {
            name: includeDeleted,
            description: `Include deleted. `,
            required: false,
            in: 'query',
        };
        const includeDeletedMeta = oldVersion
            ? Object.assign(Object.assign({}, includeDeletedMetaBase), { type: 'integer', minimum: 0, maximum: 1 }) : Object.assign(Object.assign({}, includeDeletedMetaBase), { schema: { type: 'integer', minimum: 0, maximum: 1 } });
        switch (name) {
            case 'getManyBase':
                return options.query.softDelete
                    ? [
                        searchTermMeta,
                        fieldsMeta,
                        searchMeta,
                        filterMeta,
                        sortMeta,
                        limitMeta,
                        pageMeta,
                        includeDeletedMeta,
                    ]
                    : [
                        searchTermMeta,
                        fieldsMeta,
                        searchMeta,
                        filterMeta,
                        sortMeta,
                        limitMeta,
                        pageMeta,
                    ];
            case 'getOneBase':
                return options.query.softDelete
                    ? [
                        fieldsMeta,
                        includeDeletedMeta,
                    ]
                    : [
                        fieldsMeta,
                    ];
            default:
                return [];
        }
    }
    static getQueryParamsNames() {
        const qbOptions = crud_request_1.RequestQueryBuilder.getOptions();
        const name = (n) => {
            const selected = qbOptions.paramNamesMap[n];
            return (0, util_1.isString)(selected) ? selected : selected[0];
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
    static getSwaggerVersion() {
        return exports.swaggerPkgJson ? parseInt(exports.swaggerPkgJson.version[0], 10) : 3;
    }
}
exports.Swagger = Swagger;
function ApiProperty(options) {
    return (target, propertyKey) => {
        if (exports.swagger) {
            const ApiPropertyDecorator = exports.swagger.ApiProperty || exports.swagger.ApiModelProperty;
            ApiPropertyDecorator(options)(target, propertyKey);
        }
    };
}
exports.ApiProperty = ApiProperty;
//# sourceMappingURL=swagger.helper.js.map