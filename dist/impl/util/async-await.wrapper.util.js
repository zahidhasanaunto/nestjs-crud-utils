"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncAwaitWrapper = void 0;
function asyncAwaitWrapper(promise, options = { retry: 0 }) {
    return promise
        .then((d) => [undefined, d])
        .catch((e) => {
        if (options.retry) {
            options.attempt =
                typeof options.attempt === 'undefined'
                    ? 0
                    : options.attempt + 1;
            if (options.attempt < options.retry) {
                return asyncAwaitWrapper(promise, options);
            }
        }
        return [options.err ? options.err : e, undefined];
    });
}
exports.asyncAwaitWrapper = asyncAwaitWrapper;
//# sourceMappingURL=async-await.wrapper.util.js.map