import createHistory from "history/createBrowserHistory"
import {Dispatch} from "./dispatcher"
const history = createHistory()

export type UriToRoute<Route> = (uri: string) => Route
export type RouteToUri<Route> = (route: Route) => string

// Subtract the baseUri from window.location.pathname
const getPath = (baseUri = "") => {
  if (baseUri) baseUri += "/"
  const path = window.location.pathname + window.location.search
  return path.slice(1).split("").reduce(
    (result, char, i) =>
      result + (char === baseUri[i] ? "" : char),
    ""
  )
}

export const SetRouteType = "SetRoute"

export type SetRouteOpts = {
  viaHistory?: boolean,
  noBack?: boolean
}

export const buildSetRoute =
  <Route>(
    routeToUri: RouteToUri<Route>,
    baseUri: string = ""
  ) => (
        route: Route,
        opts: SetRouteOpts
      ) => (_: Route) => {
        if (opts.viaHistory) {
          const historyAction = opts.noBack ? history.replace : history.push
          historyAction(
            `/${baseUri ? baseUri + "/" : ""}${routeToUri(route)}`
          )
        }
        return route
}

export const load = <Route>(dispatch: Dispatch<Route>,
                            uriToRoute: UriToRoute<Route>,
                            routeToUri: RouteToUri<Route>,
                            baseUri = "",
                            isHotReloading = false) => {
  const setRoute = buildSetRoute(routeToUri, baseUri)
  if (!isHotReloading && !(window as any).IS_CORDOVA)
    dispatch(
      setRoute(
        uriToRoute(
          getPath(baseUri)
        ),
        {viaHistory: true}
      ),
      SetRouteType
    )
  return history.listen((_, action) => {
    if (action === "POP") dispatch(
      setRoute(
        uriToRoute(
          getPath(baseUri)
        ),
        {viaHistory: true}
      ),
      SetRouteType
    )
  })
}

// STATE

export interface State<Route> {
  route: Route
}

