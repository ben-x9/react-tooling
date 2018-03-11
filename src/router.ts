import * as Redux from "redux"
import * as ReactRedux from "react-redux"
import createHistory from "history/createBrowserHistory"
const history = createHistory()

export type UriToRoute<Route> = (uri: string) => Route
export type RouteToUri<Route> = (route: Route) => string

// Subtract the baseUri from window.location.pathname
const getPath = (baseUri = "") => {
  if (baseUri) baseUri += "/"
  return window.location.pathname.slice(1).split("").reduce(
    (result, char, i) =>
      result + (char === baseUri[i] ? "" : char),
    ""
  )
}

export const load = <Route>(dispatch: ReactRedux.Dispatch<Redux.Action>,
                            uriToRoute: UriToRoute<Route>,
                            baseUri = "",
                            isHotReloading = false) => {
  if (!isHotReloading)
    dispatch(goto(uriToRoute(getPath(baseUri)), {viaHistory: true}))
  return history.listen((_, action) => {
    if (action === "POP") dispatch(goto(
      uriToRoute(getPath(baseUri)), {viaHistory: true}
    ))
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

export interface GotoOpts {
  viaHistory?: boolean
  replace?: boolean
}

export interface Goto<Route> {
  type: ActionType.Goto
  route: Route,
  opts: GotoOpts
}
export const goto = <Route>(route: Route, opts: GotoOpts = {}): Goto<Route> => ({
  type: ActionType.Goto,
  route,
  opts
})

export const update = <Route>(
                       state: State<Route>,
                       action: Action<Route>,
                       routeToUri: RouteToUri<Route>,
                       baseUri = ""): State<Route> => {
  switch (action.type) {
    case ActionType.Goto:
      if (!action.opts.viaHistory) {
        const historyAction = action.opts.replace ?
          history.replace : history.push
        historyAction(
          "/" +
          (baseUri ? baseUri + "/" : "") +
          routeToUri(action.route)
        )
      }
      return {...state, route: action.route}
  }
}
