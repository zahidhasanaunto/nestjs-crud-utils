"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntityMetadata = void 0;
const typeorm_1 = require("typeorm");
async function getEntityMetadata(entityName) {
    var _a;
    try {
        let entity = await (0, typeorm_1.getConnection)().getMetadata(entityName);
        const searchTerms = ((_a = entity.target) === null || _a === void 0 ? void 0 : _a.SEARCH_TERMS) || [];
        const ownColumns = await entity.ownColumns
            .map((column) => column.propertyName)
            .filter((colName) => colName !== 'id');
        const relations = await entity.relations.map((column) => column.propertyName);
        relations.map((r) => {
            if (ownColumns.includes(r)) {
                const i = ownColumns.indexOf(r);
                ownColumns.splice(i, 1);
            }
        });
        return { ownColumns, relations, searchTerms };
    }
    catch (error) {
        throw new Error('Invalid Entity Name');
    }
}
exports.getEntityMetadata = getEntityMetadata;
//# sourceMappingURL=db.util.js.map