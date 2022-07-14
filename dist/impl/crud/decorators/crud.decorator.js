"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crud = void 0;
const crud_1 = require("../crud");
const Crud = (options) => (target) => {
    const factoryMethod = options.routesFactory || crud_1.CrudRoutesFactory;
    let factory = new factoryMethod(target, options);
    factory = undefined;
};
exports.Crud = Crud;
//# sourceMappingURL=crud.decorator.js.map