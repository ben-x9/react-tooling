"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var dispatchMiddleware = function (store) {
    return function (next) {
        return function (action) {
            var syncActivityFinished = false;
            var actionQueue = [];
            function flushQueue() {
                actionQueue.forEach(function (a) { return store.dispatch(a); });
                actionQueue = [];
            }
            function dispatch(action) {
                actionQueue = actionQueue.concat([action]);
                if (syncActivityFinished) {
                    lodash_1.defer(function () { return flushQueue(); });
                }
            }
            var actionWithDispatch = Object.assign({}, action, { dispatch: dispatch });
            next(actionWithDispatch);
            syncActivityFinished = true;
            flushQueue();
            return actionWithDispatch;
        };
    };
};
exports.default = dispatchMiddleware;
//# sourceMappingURL=dispatchMiddleware.js.map