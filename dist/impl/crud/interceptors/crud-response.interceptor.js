"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const operators_1 = require("rxjs/operators");
const util_1 = require("../../util");
const enums_1 = require("../enums");
const crud_base_interceptor_1 = require("./crud-base.interceptor");
const actionToDtoNameMap = {
    [enums_1.CrudActions.ReadAll]: 'getMany',
    [enums_1.CrudActions.ReadOne]: 'get',
    [enums_1.CrudActions.CreateMany]: 'createMany',
    [enums_1.CrudActions.CreateOne]: 'create',
    [enums_1.CrudActions.UpdateOne]: 'update',
    [enums_1.CrudActions.ReplaceOne]: 'replace',
    [enums_1.CrudActions.DeleteAll]: 'delete',
    [enums_1.CrudActions.DeleteOne]: 'delete',
    [enums_1.CrudActions.RecoverOne]: 'recover',
};
let CrudResponseInterceptor = class CrudResponseInterceptor extends crud_base_interceptor_1.CrudBaseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => this.serialize(context, data)));
    }
    transform(dto, data) {
        if (!(0, util_1.isObject)(data) || (0, util_1.isFalse)(dto)) {
            return data;
        }
        if (!(0, util_1.isFunction)(dto)) {
            return data.constructor !== Object ? (0, class_transformer_1.classToPlain)(data) : data;
        }
        return data instanceof dto
            ? (0, class_transformer_1.classToPlain)(data)
            : (0, class_transformer_1.classToPlain)((0, class_transformer_1.classToPlainFromExist)(data, new dto()));
    }
    serialize(context, data) {
        const { crudOptions, action } = this.getCrudInfo(context);
        const { serialize } = crudOptions;
        const dto = serialize[actionToDtoNameMap[action]];
        const isArray = Array.isArray(data);
        switch (action) {
            case enums_1.CrudActions.ReadAll:
                return isArray
                    ? data.map((item) => this.transform(serialize.get, item))
                    : this.transform(dto, data);
            case enums_1.CrudActions.CreateMany:
                return isArray
                    ? data.map((item) => this.transform(dto, item))
                    : this.transform(dto, data);
            default:
                return this.transform(dto, data);
        }
    }
};
CrudResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], CrudResponseInterceptor);
exports.CrudResponseInterceptor = CrudResponseInterceptor;
//# sourceMappingURL=crud-response.interceptor.js.map