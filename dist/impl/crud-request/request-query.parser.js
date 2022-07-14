"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestQueryParser = void 0;
const util_1 = require("../util");
const exceptions_1 = require("./exceptions");
const request_query_builder_1 = require("./request-query.builder");
const request_query_validator_1 = require("./request-query.validator");
class RequestQueryParser {
    constructor() {
        this.fields = [];
        this.paramsFilter = [];
        this.authPersist = undefined;
        this.filter = [];
        this.or = [];
        this.join = [];
        this.sort = [];
    }
    get _options() {
        return request_query_builder_1.RequestQueryBuilder.getOptions();
    }
    static create() {
        return new RequestQueryParser();
    }
    getParsed() {
        return {
            fields: this.fields,
            paramsFilter: this.paramsFilter,
            authPersist: this.authPersist,
            search: this.search,
            filter: this.filter,
            or: this.or,
            join: this.join,
            sort: this.sort,
            limit: this.limit,
            offset: this.offset,
            page: this.page,
            cache: this.cache,
            includeDeleted: this.includeDeleted,
        };
    }
    parseQuery(query, customOperators = {}) {
        if ((0, util_1.isObject)(query)) {
            const paramNames = (0, util_1.objKeys)(query);
            if ((0, util_1.hasLength)(paramNames)) {
                this._query = query;
                this._paramNames = paramNames;
                const searchData = this._query[this.getParamNames('search')[0]];
                this.search = this.parseSearchQueryParam(searchData);
                if ((0, util_1.isNil)(this.search)) {
                    this.filter = this.parseQueryParam('filter', this.conditionParser.bind(this, 'filter', customOperators));
                    this.or = this.parseQueryParam('or', this.conditionParser.bind(this, 'or', customOperators));
                }
                this.fields =
                    this.parseQueryParam('fields', this.fieldsParser.bind(this))[0] || [];
                this.join = this.parseQueryParam('join', this.joinParser.bind(this));
                this.sort = this.parseQueryParam('sort', this.sortParser.bind(this));
                this.limit = this.parseQueryParam('limit', this.numericParser.bind(this, 'limit'))[0];
                this.offset = this.parseQueryParam('offset', this.numericParser.bind(this, 'offset'))[0];
                this.page = this.parseQueryParam('page', this.numericParser.bind(this, 'page'))[0];
                this.cache = this.parseQueryParam('cache', this.numericParser.bind(this, 'cache'))[0];
                this.includeDeleted = this.parseQueryParam('includeDeleted', this.numericParser.bind(this, 'includeDeleted'))[0];
            }
        }
        return this;
    }
    parseParams(params, options) {
        if ((0, util_1.isObject)(params)) {
            const paramNames = (0, util_1.objKeys)(params);
            if ((0, util_1.hasLength)(paramNames)) {
                this._params = params;
                this._paramsOptions = options;
                this.paramsFilter = paramNames
                    .map((name) => this.paramParser(name))
                    .filter((filter) => filter);
            }
        }
        return this;
    }
    setAuthPersist(persist = {}) {
        this.authPersist = persist || {};
    }
    convertFilterToSearch(filter) {
        const isEmptyValue = {
            isnull: true,
            notnull: true,
        };
        return filter
            ? {
                [filter.field]: {
                    [filter.operator]: isEmptyValue[filter.operator]
                        ? isEmptyValue[filter.operator]
                        : filter.value,
                },
            }
            : {};
    }
    getParamNames(type) {
        return this._paramNames.filter((p) => {
            const name = this._options.paramNamesMap[type];
            return (0, util_1.isString)(name)
                ? name === p
                : name.some((m) => m === p);
        });
    }
    getParamValues(value, parser) {
        if ((0, util_1.isStringFull)(value)) {
            return [parser.call(this, value)];
        }
        if ((0, util_1.isArrayFull)(value)) {
            return value.map((val) => parser(val));
        }
        return [];
    }
    parseQueryParam(type, parser) {
        const param = this.getParamNames(type);
        if ((0, util_1.isArrayFull)(param)) {
            return param.reduce((a, name) => [...a, ...this.getParamValues(this._query[name], parser)], []);
        }
        return [];
    }
    parseValue(val) {
        try {
            const parsed = JSON.parse(val);
            if (!(0, util_1.isDate)(parsed) && (0, util_1.isObject)(parsed)) {
                return val;
            }
            else if (typeof parsed === 'number' &&
                parsed.toLocaleString('fullwide', { useGrouping: false }) !== val) {
                return val;
            }
            return parsed;
        }
        catch (ignored) {
            if ((0, util_1.isDateString)(val)) {
                return new Date(val);
            }
            return val;
        }
    }
    parseValues(vals) {
        if ((0, util_1.isArrayFull)(vals)) {
            return vals.map((v) => this.parseValue(v));
        }
        else {
            return this.parseValue(vals);
        }
    }
    fieldsParser(data) {
        return data.split(this._options.delimStr);
    }
    parseSearchQueryParam(d) {
        try {
            if ((0, util_1.isNil)(d)) {
                return undefined;
            }
            const data = JSON.parse(d);
            if (!(0, util_1.isObject)(data)) {
                throw new Error();
            }
            return data;
        }
        catch (_) {
            throw new exceptions_1.RequestQueryException('Invalid search param. JSON expected');
        }
    }
    conditionParser(cond, customOperators, data) {
        const isArrayValue = [
            'in',
            'notin',
            'between',
            '$in',
            '$notin',
            '$between',
            '$inL',
            '$notinL',
        ].concat(Object.keys(customOperators).filter((op) => customOperators[op].isArray));
        const isEmptyValue = ['isnull', 'notnull', '$isnull', '$notnull'];
        const param = data.split(this._options.delim);
        const field = param[0].trim();
        const operator = param[1].trim();
        let value = param[2].trim() || '';
        if (isArrayValue.some((name) => name === operator)) {
            value = value.split(this._options.delimStr);
        }
        value = this.parseValues(value);
        if (!isEmptyValue.some((name) => name === operator) && !(0, util_1.hasValue)(value)) {
            throw new exceptions_1.RequestQueryException(`Invalid ${cond} value`);
        }
        const condition = { field, operator, value };
        (0, request_query_validator_1.validateCondition)(condition, cond, customOperators);
        return condition;
    }
    joinParser(data) {
        const param = data.split(this._options.delim);
        const join = {
            field: param[0],
            select: (0, util_1.isStringFull)(param[1])
                ? param[1].split(this._options.delimStr)
                : undefined,
        };
        (0, request_query_validator_1.validateJoin)(join);
        return join;
    }
    sortParser(data) {
        const param = data.split(this._options.delimStr);
        const sort = {
            field: param[0],
            order: param[1],
        };
        (0, request_query_validator_1.validateSort)(sort);
        return sort;
    }
    numericParser(num, data) {
        const val = this.parseValue(data);
        (0, request_query_validator_1.validateNumeric)(val, num);
        return val;
    }
    paramParser(name) {
        (0, request_query_validator_1.validateParamOption)(this._paramsOptions, name);
        const option = this._paramsOptions[name];
        if (option.disabled) {
            return undefined;
        }
        let value = this._params[name];
        switch (option.type) {
            case 'number':
                value = this.parseValue(value);
                (0, request_query_validator_1.validateNumeric)(value, `param ${name}`);
                break;
            case 'uuid':
                (0, request_query_validator_1.validateUUID)(value, name);
                break;
            default:
                break;
        }
        return { field: option.field, operator: '$eq', value };
    }
}
exports.RequestQueryParser = RequestQueryParser;
//# sourceMappingURL=request-query.parser.js.map