"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudAuth = void 0;
const reflection_helper_1 = require("../crud/reflection.helper");
const CrudAuth = (options) => (target) => {
    reflection_helper_1.R.setCrudAuthOptions(options, target);
};
exports.CrudAuth = CrudAuth;
//# sourceMappingURL=crud-auth.decorator.js.map