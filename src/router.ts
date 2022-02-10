import {Dispatch, tag} from "hydra-dispatch"
import {createHistory} from "./history"

const history = createHistory()

export type UriToRoute<Route> = (uri: string) => Route
export type RouteToUri<Route> = (route: Route) => string

// Subtract the baseUri from window.location.pathname
const getPath = (baseUri = "") => {
  if (baseUri) baseUri += "/"
  const path = window.location.pathname + window.location.search
  return path
    .slice(1)
    .split("")
    .reduce((result, char, i) => result + (char === baseUri[i] ? "" : char), "")
}

export const SetRouteType = "SetRoute"

export type SetRouteOpts = {
  pop?: boolean
  replace?: boolean
}

export const buildSetRoute = <Route>(
  routeToUri: RouteToUri<Route>,
  baseUri: string = ""
) => {
  return (route: Route, opts: SetRouteOpts = {}) => (_: Route) => {
    if (!opts.pop) {
      const historyAction = opts.replace ? history.replace : history.push
      historyAction(`/${baseUri ? baseUri + "/" : ""}${routeToUri(route)}`)
    }
    return route
  }
}

export const load = <Route>(
  dispatch: Dispatch<Route>,
  uriToRoute: UriToRoute<Route>,
  routeToUri: RouteToUri<Route>,
  baseUri = "",
  isHotReloading = false
) => {
  const setRoute = buildSetRoute(routeToUri, baseUri)
  if (!isHotReloading && !(window as any).IS_CORDOVA)
    dispatch(tag(setRoute(uriToRoute(getPath(baseUri))) , SetRouteType))
  return history.listen(({action}) => {
    if (action === "POP")
      dispatch(
        tag(
          setRoute(uriToRoute(getPath(baseUri)), {pop: true}),
          SetRouteType
        )
      )
  })
}

// STATE

export interface State<Route> {
  route: Route
}
