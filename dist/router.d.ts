import * as Redux from "redux";
export declare type UriToRoute<Route> = (uri: string) => Route;
export declare type RouteToUri<Route> = (route: Route) => string;
export declare const load: <Route>(dispatch: Redux.Dispatch<Redux.Action>, uriToRoute: UriToRoute<Route>) => () => void;
export declare type Action<Route> = Goto<Route>;
export declare enum ActionType {
    Goto = "Goto",
}
export interface Goto<Route> {
    type: ActionType.Goto;
    route: Route;
    viaHistory: boolean;
}
export declare const goto: <Route>(route: Route, viaHistory?: boolean) => Goto<Route>;
export declare const update: <Route>(action: Goto<Route>, routeToUri: RouteToUri<Route>) => void;
