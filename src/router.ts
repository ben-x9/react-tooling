import * as Redux from "redux"
import * as ReactRedux from "react-redux"
import createHistory from "history/createBrowserHistory"
const history = createHistory()

export type UriToRoute<Route> = (uri: string) => Route
export type RouteToUri<Route> = (route: Route) => string

export const load = <Route>(dispatch: ReactRedux.Dispatch<Redux.Action>,
                            uriToRoute: UriToRoute<Route>) => {
  dispatch(goto(uriToRoute(window.location.pathname), true))
  return history.listen((location, action) => {
    if (action === "POP") dispatch(goto(uriToRoute(location.pathname), true))
  })
}

// STATE

export interface State<Route> {
  route: Route
}

// UPDATE

export type Action<Route> = Goto<Route>

export enum ActionType {
  Goto = "Goto"
}

export const reactsTo = <Route>(action: Redux.Action):
    action is Action<Route> => {
  switch (action.type) {
    case ActionType.Goto:
      return true
    default: return false
  }
}

export interface Goto<Route> {
  type: ActionType.Goto
  route: Route,
  viaHistory: boolean
}
export const goto = <Route>(route: Route, viaHistory = false): Goto<Route> => ({
  type: ActionType.Goto,
  route,
  viaHistory
})

export const update = <Route>(
                       state: State<Route>,
                       action: Action<Route>,
                       routeToUri: RouteToUri<Route>): State<Route> => {
  switch (action.type) {
    case ActionType.Goto:
      if (!action.viaHistory) history.push(routeToUri(action.route))
      return { ...state, route: action.route }
  }
}
