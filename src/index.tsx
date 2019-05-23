import * as React from "react"
import * as Redux from "redux"
import {createStore, applyMiddleware, compose} from "redux"
import {composeWithDevTools} from "remote-redux-devtools"
import {Provider, connect} from "react-redux"
import * as Router from "./router"
import {RouteToUri, UriToRoute} from "./router"
import {F1} from "functools-ts"
import {childDispatch, Dispatcher} from "hydra-dispatch"
import {updateStateReducer, dispatcherFromRedux, GotErrorType, GotError, isSetState} from "hydra-dispatch-redux"
import thunk from "redux-thunk"

export * from "./types"
export * from "./view"

export type JSXElement = React.ReactElement<any>

export {React, JSX}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

let store: Redux.Store<any>

export interface Opts {
  baseUri?: string
  rootHTMLElement?: Element | null
  remoteDevTools?: {
    name: string
    hostname: string
    port: number
  }
  onLoad?: () => any
  onHMR?: () => any
}

const defaultOpts: Opts = {
  baseUri: "",
  // rootHTMLElement: document.body.firstElementChild,
  // remoteDevTools: {
  //   name: "My React App",
  //   hostname: "localhost",
  //   port: 8000
  // },
  onLoad: () => null
}

export type SetRoute<Route> = {
  setRoute: (route: Route, opts?: Router.SetRouteOpts) => void
}

export type RootDispatcher<State, Route> = SetRoute<Route> & Dispatcher<State>

export type RootView<State, Route> =
  | ((state: State) => JSXElement)
  | {new (state: State & Dispatcher<State>): React.Component<State>}
  | {new (state: State & RootDispatcher<State, Route>): React.Component<State>}

export type View<State> =
  | ((state: State) => JSXElement)
  | {new (state: State & Dispatcher<State>): React.Component<State>}

export type AppHooks<State, Route> = {
  onInit?: (state: State) => State
  onRouteChanged?: (route: Route, state: State) => State
  onError?: (error: Error, state: State) => State
}

export const load = function<State extends Router.State<Route>, Route>(
  initialState: State,
  RootView: RootView<State, Route>,
  routeToUri: RouteToUri<Route>,
  uriToRoute: UriToRoute<Route>,
  _module: NodeModule,
  render: F1<JSXElement, void>,
  hooks: AppHooks<State, Route> = {},
  opts = defaultOpts
) {
  const baseUri = opts.baseUri || defaultOpts.baseUri
  const remoteDevTools = opts.remoteDevTools || defaultOpts.remoteDevTools

  // Initalize the store

  // const composeEnhancers =
  //   (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  //     (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  //       getMonitor: (monitor: any) => { setMonitor(monitor) }
  //     }) :
  //     compose

  const composeEnhancers = remoteDevTools
    ? composeWithDevTools(Object.assign(remoteDevTools, {realtime: true}))
    : (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose

  const isHotReloading = store ? true : false

  if (isHotReloading) {
    store!.replaceReducer(updateStateReducer as any)
  } else {
    store = createStore(
      (state: State, action: Redux.AnyAction): State => {
        const newState = updateStateReducer(state, action)
        if (action.type === GotErrorType && hooks.onError)
          return hooks.onError((action as GotError).error, newState)
        if (isSetState(action) && action.type === "SetRoute" && hooks.onRouteChanged) {
          return hooks.onRouteChanged(newState.route, newState)
        }
        return newState
      },
      initialState as any,
      composeEnhancers(applyMiddleware(thunk))
    )
    if (opts.onLoad) opts.onLoad()
  }

  class Index extends React.Component<any> {
    unloadRouter: () => void

    constructor(state: State) {
      super(state)
      if (typeof (window as any).__REACT_HOT_LOADER__ !== "undefined") {
        ;(window as any).__REACT_HOT_LOADER__.warnings = false
      }
    }

    getRootDispatcher(): RootDispatcher<State, Route> {
      const routeDispatcher = childDispatch<State, "route">(this.props.dispatch, "route")
      const setRoute = Router.buildSetRoute(routeToUri, baseUri)
      return {
        setRoute: (route: Route, opts?: Router.SetRouteOpts) => {
          routeDispatcher(setRoute(route, opts) as any, Router.SetRouteType)
        },
        dispatch: this.props.dispatch
      }
    }

    componentWillMount() {
      const routeDispatcher = childDispatch<State, "route">(this.props.dispatch, "route")
      this.unloadRouter = Router.load(
        routeDispatcher,
        uriToRoute,
        routeToUri,
        baseUri,
        isHotReloading
      )
      if (!isHotReloading && hooks.onInit) {
        this.props.dispatch((state: State) => hooks.onInit!(state), "OnInitHook")
      }
    }

    componentWillUnmount() {
      this.unloadRouter()
    }

    render() {
      // Force TS to see RootJSXElement as an SFC due to this bug:
      // https://github.com/Microsoft/TypeScript/issues/15463
      const Elem = (RootView as any) as (
        props: State & RootDispatcher<State, Route>
      ) => JSX.Element
      return <Elem {...this.props as State} {...this.getRootDispatcher()} />
    }
  }

  const View = connect(
    (s: any) => s, 
    (dispatch) => ({
      dispatch: dispatcherFromRedux(dispatch)
    })
  )(Index)

  render(
    <Provider store={store!}>
      <View />
    </Provider>
  )
}

export const exists = (it: any) => it !== undefined && it !== null

export function log<T>(value: T, ...others: any[]) {
  console.log(...others.concat(value))
  return value
}

// This is a bit of a hack, but useful
// https://github.com/Microsoft/TypeScript/issues/13723#issuecomment-275730246
export type Mutable<T extends {[x: string]: any}, K extends string> = {
  [P in K]: T[P]
}