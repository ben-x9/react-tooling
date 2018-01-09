"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createBrowserHistory_1 = require("history/createBrowserHistory");
var history = createBrowserHistory_1.default();
exports.load = function (dispatch, uriToRoute) {
    dispatch(exports.goto(uriToRoute(window.location.pathname), true));
    return history.listen(function (location, action) {
        if (action === "POP")
            dispatch(exports.goto(uriToRoute(location.pathname), true));
    });
};
var ActionType;
(function (ActionType) {
    ActionType["Goto"] = "Goto";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
exports.goto = function (route, viaHistory) {
    if (viaHistory === void 0) { viaHistory = false; }
    return ({
        type: ActionType.Goto,
        route: route,
        viaHistory: viaHistory
    });
};
exports.update = function (action, routeToUri) {
    switch (action.type) {
        case ActionType.Goto:
            if (!action.viaHistory)
                history.push(routeToUri(action.route));
            return;
    }
};
//# sourceMappingURL=router.js.map