"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayGroupByAttribute = exports.spilledFullName = exports.asyncForEach = exports.gen4digitRandomNumber = void 0;
const gen4digitRandomNumber = () => {
    return Math.floor(1000 + Math.random() * 9000);
};
exports.gen4digitRandomNumber = gen4digitRandomNumber;
const asyncForEach = async (array, callback) => {
    if (!Array.isArray(array)) {
        throw Error('Expected an array');
    }
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};
exports.asyncForEach = asyncForEach;
const spilledFullName = (fullName) => {
    const name = fullName.split(' ');
    const firstName = name[0] || '';
    const lastName = name[1] || '';
    return { firstName, lastName };
};
exports.spilledFullName = spilledFullName;
const ArrayGroupByAttribute = (array, attr) => {
    const result = array.reduce((r, a) => {
        r[a[attr]] = r[a[attr]] || [];
        r[a[attr]].push(a);
        return r;
    }, Object.create(null));
    return result;
};
exports.ArrayGroupByAttribute = ArrayGroupByAttribute;
//# sourceMappingURL=common.util.js.map