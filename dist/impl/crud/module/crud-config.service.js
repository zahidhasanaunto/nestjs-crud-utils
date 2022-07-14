"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudConfigService = void 0;
const crud_request_1 = require("../../crud-request");
const util_1 = require("../../util");
const deepmerge = require("deepmerge");
class CrudConfigService {
    static load(config = {}) {
        const auth = (0, util_1.isObjectFull)(config.auth) ? config.auth : {};
        const query = (0, util_1.isObjectFull)(config.query) ? config.query : {};
        const routes = (0, util_1.isObjectFull)(config.routes) ? config.routes : {};
        const operators = (0, util_1.isObjectFull)(config.operators) ? config.operators : {};
        const params = (0, util_1.isObjectFull)(config.params) ? config.params : {};
        const serialize = (0, util_1.isObjectFull)(config.serialize) ? config.serialize : {};
        if ((0, util_1.isObjectFull)(config.queryParser)) {
            crud_request_1.RequestQueryBuilder.setOptions(Object.assign({}, config.queryParser));
        }
        CrudConfigService.config = deepmerge(CrudConfigService.config, { auth, query, routes, operators, params, serialize }, { arrayMerge: (a, b, c) => b });
    }
}
exports.CrudConfigService = CrudConfigService;
CrudConfigService.config = {
    auth: {},
    query: {
        alwaysPaginate: false,
    },
    operators: {},
    routes: {
        getManyBase: { interceptors: [], decorators: [] },
        getOneBase: { interceptors: [], decorators: [] },
        createOneBase: { interceptors: [], decorators: [], returnShallow: false },
        createManyBase: { interceptors: [], decorators: [] },
        updateOneBase: {
            interceptors: [],
            decorators: [],
            allowParamsOverride: false,
            returnShallow: false,
        },
        replaceOneBase: {
            interceptors: [],
            decorators: [],
            allowParamsOverride: false,
            returnShallow: false,
        },
        deleteOneBase: { interceptors: [], decorators: [], returnDeleted: false },
        recoverOneBase: {
            interceptors: [],
            decorators: [],
            returnRecovered: false,
        },
    },
    params: {},
};
//# sourceMappingURL=crud-config.service.js.map