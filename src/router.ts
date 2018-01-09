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

// UPDATE

export type Action<Route> = Goto<Route>

export enum ActionType {
  Goto = "Goto"
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

export const update = <Route>(action: Action<Route>,
                              routeToUri: RouteToUri<Route>) => {
  switch (action.type) {
    case ActionType.Goto:
      if (!action.viaHistory) history.push(routeToUri(action.route))
      return
  }
}
