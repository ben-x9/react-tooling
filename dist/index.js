"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
exports.React = React;
var ReactDOM = require("react-dom");
var redux_1 = require("redux");
var react_redux_1 = require("react-redux");
var react_hot_loader_1 = require("react-hot-loader");
var dispatchMiddleware_1 = require("./dispatchMiddleware");
var Router = require("./router");
var DispatchComponent = (function (_super) {
    __extends(DispatchComponent, _super);
    function DispatchComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DispatchComponent;
}(React.PureComponent));
exports.DispatchComponent = DispatchComponent;
exports.GotoType = Router.ActionType.Goto;
exports.goto = Router.goto;
exports.load = function (RootElement, update, routeToUri, uriToRoute) {
    var wrappedUpdate = function (state, action) {
        Router.update(action, routeToUri);
        return update(state, action);
    };
    var composeEnhancers = window.
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux_1.compose;
    var store = redux_1.createStore(wrappedUpdate, composeEnhancers(redux_1.applyMiddleware(dispatchMiddleware_1.default)));
    var Index = (function (_super) {
        __extends(Index, _super);
        function Index() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Index.prototype.componentWillMount = function () {
            this.unloadRouter = Router.load(this.props.dispatch, uriToRoute);
        };
        Index.prototype.componentWillUnmount = function () {
            this.unloadRouter();
        };
        Index.prototype.render = function () {
            return React.createElement(RootElement, __assign({}, this.props));
        };
        return Index;
    }(DispatchComponent));
    var View = react_redux_1.connect(function (s) { return s; })(Index);
    ReactDOM.render(React.createElement(react_hot_loader_1.AppContainer, null,
        React.createElement(react_redux_1.Provider, { store: store },
            React.createElement(View, null))), document.getElementById("root"));
    return function (update) { store.replaceReducer(update); };
};
//# sourceMappingURL=index.js.map