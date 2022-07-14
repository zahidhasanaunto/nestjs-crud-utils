"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmail = exports.isMobileNumber = void 0;
const isMobileNumber = (phoneNumber) => {
    try {
        const regex = /^\+?01[3-9][0-9]{8}\b$/g;
        let validNumber;
        const number = phoneNumber.match(regex);
        if (number) {
            number.map((number) => {
                validNumber = number.slice(number.length - 11, number.length);
            });
            return validNumber;
        }
        else {
            return false;
        }
    }
    catch (error) {
        return false;
    }
};
exports.isMobileNumber = isMobileNumber;
const isEmail = (email) => {
    try {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let validEmail;
        const _email = email.match(regex);
        if (_email.length) {
            validEmail = _email[0];
            return validEmail;
        }
        else {
            return false;
        }
    }
    catch (error) {
        return false;
    }
};
exports.isEmail = isEmail;
//# sourceMappingURL=checkFunc.util.js.map