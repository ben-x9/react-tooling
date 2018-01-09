/// <reference types="react" />
import * as React from "react";
import * as Redux from "redux";
import * as ReactRedux from "react-redux";
import * as Router from "./router";
export { React };
export declare type Dispatch = ReactRedux.Dispatch<Redux.Action>;
export declare type Dispatcher = {
    dispatch: Dispatch;
};
export declare class DispatchComponent<P> extends React.PureComponent<P & Dispatcher> {
}
export declare type Goto<Route> = Router.Action<Route>;
export declare type GotoType = Router.ActionType;
export declare const GotoType: Router.ActionType;
export declare const goto: <Route>(route: Route, viaHistory?: boolean) => Router.Goto<Route>;
export declare const load: <State extends {}, Action extends Redux.Action, Route>(RootElement: (state: State) => JSX.Element, update: (state: State, action: Action) => State, routeToUri: Router.RouteToUri<Route>, uriToRoute: Router.UriToRoute<Route>) => (update: (state: State, action: Action) => State) => void;
