import createHistory from "history/createBrowserHistory"
import {DispatchUpdate} from "./dispatcher"
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

export const load = <Route>(dispatch: DispatchUpdate<Route>,
                            uriToRoute: UriToRoute<Route>,
                            routeToUri: RouteToUri<Route>,
                            baseUri = "",
                            isHotReloading = false) => {
  const setRoute = buildSetRoute(routeToUri, baseUri)
  console.log(setRoute.name)
  if (!isHotReloading && !(window as any).IS_CORDOVA)
    dispatch(
      setRoute(
        uriToRoute(
          getPath(baseUri)
        ),
        {viaHistory: true}
      ),
      "SetRoute"
    )
  return history.listen((_, action) => {
    if (action === "POP") dispatch(
      setRoute(
        uriToRoute(
          getPath(baseUri)
        ),
        {viaHistory: true}
      ),
      "SetRoute"
    )
  })
}

// STATE

export interface State<Route> {
  route: Route
}

