import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import {createStore, applyMiddleware, compose} from "redux"
import {composeWithDevTools} from "remote-redux-devtools"
import {Provider, connect} from "react-redux"
import {AppContainer} from "react-hot-loader"
import {dispatch, flagReplaying, setMonitor, isReplaying} from "./dispatchMiddleware"
import * as Router from "./router"
import defer from "./defer"
import {RouteToUri, UriToRoute} from "./router"
import {UpdateState, isPromise, SyncState, isObservable, Dispatcher, DispatchUpdate, createDispatch, createFromReduxDispatch, ActionDispatch, noReplay, isUpdateState} from "./dispatcher"
import {catchError} from "rxjs/operators"

export * from "./types"
export * from "./view"

export type JSXElement = React.ReactElement<any>

export {React, JSX}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export type AnyAction = Redux.Action

export type ActionDispatcher = {dispatch: ActionDispatch}
export type Dispatcher<S> = Dispatcher<S>
export type DispatchUpdate<S> = DispatchUpdate<S>
export {createDispatch, noReplay}

export class Component<P> extends React.PureComponent<P & ActionDispatcher> {
  constructor(props: P & ActionDispatcher) {
    super(props)
    this.dispatch = this.dispatch.bind(this)
  }

  dispatch<A extends Redux.Action>(
           action: A) {
    return this.props.dispatch(action)
  }
}

export enum ActionType {
  Init = "ReactiveElm/Init"
}
export type InitType = ActionType
export const InitType = ActionType.Init

export interface Init {
  type: "ReactiveElm/Init"
}
export const init = {
  type: "ReactiveElm/Init"
}

let store: Redux.Store<any>

export interface Opts {
  baseUri?: string,
  rootHTMLElement?: Element | null,
  remoteDevTools?: {
    name: string
    hostname: string,
    port: number
  },
  onLoad?: () => any,
  onHMR?: () => any
}

const defaultOpts: Opts = {
  baseUri: "",
  rootHTMLElement: document.body.firstElementChild,
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
  ((state: State) => JSXElement) | {new(state: State & Dispatcher<State>): Component<State>} | {new(state: State & RootDispatcher<State, Route>): Component<State>}

export type View<State> =
  ((state: State) => JSXElement) | {new(state: State & Dispatcher<State>): Component<State>}

export type AppHooks<State, Route> = {
  onInit?: (state: State, dispatch: RootDispatcher<State, Route>) => void
  onRouteChanged?: (route: Route, dispatch: RootDispatcher<State, Route>) => void
  onError?: (error: Error, dispatch: RootDispatcher<State, Route>) => void
}

export type Action<S> = Init | UpdateState<S>

export const load = function
    <State extends Router.State<Route>,
     Route>(
    initialState: State,
    RootView: RootView<State, Route>,
    routeToUri: RouteToUri<Route>,
    uriToRoute: UriToRoute<Route>,
    module: NodeModule,
    hooks: AppHooks<State, Route> = {},
    opts = defaultOpts) {

  const baseUri = opts.baseUri || defaultOpts.baseUri
  const rootHTMLElement =
    opts.rootHTMLElement || defaultOpts.rootHTMLElement as Element | null
  const remoteDevTools = opts.remoteDevTools || defaultOpts.remoteDevTools
  const routeLens = {
    get: (state: State): Route => state.route,
    set: (newRoute: Route) => (state: State): State => (
      {...(state as any), route: newRoute})
  }
  const getRouteDispatch =
    (rootDispatcher: RootDispatcher<State, Route>): DispatchUpdate<Route> =>
      createDispatch(rootDispatcher.dispatch, routeLens)

  const getRootDispatcher =
    (dispatch: ActionDispatch): RootDispatcher<State, Route> =>  {
      const stateDispatcher = createFromReduxDispatch<State>(dispatch)
      const routeDispatcher = createDispatch(stateDispatcher, routeLens)
      const setRoute = Router.buildSetRoute(routeToUri, baseUri)
      return {
        setRoute: (route: Route, opts?: Router.SetRouteOpts) => {
          routeDispatcher(setRoute(route, opts || {viaHistory: true}), Router.SetRouteType)
        },
        dispatch: stateDispatcher
      }
    }

  type ActionWithDispatch = Action<State> & {dispatchFromUpdate: ActionDispatch}

  const onError =
    (error: Error, stateDispatcher: RootDispatcher<State, Route>): void =>
      hooks.onError
        ? hooks.onError(error, stateDispatcher)
        : console.error(error)

  const schedule = (state: State,
                    {dispatchFromUpdate, ...action}: ActionWithDispatch) => {
    if (isReplaying() && (action as any).noReplay)
      return state

    const stateDispatcher = getRootDispatcher(dispatchFromUpdate)
    switch (action.type) {
        case InitType:
          if (hooks.onInit) hooks.onInit(state, stateDispatcher)
          return state
        default:
          if (isUpdateState(action)) {
            try {
              let cont = action.update(state)
              if (isPromise(cont)) {
                cont.then(pupdate => dispatchFromUpdate(SyncState(pupdate)))
                    .catch(err => onError(err as Error, stateDispatcher))
                return state
              } else if (isObservable(cont)) {
                cont
                  .pipe(
                    catchError(err =>
                      onError(err as Error, stateDispatcher) as never
                    )
                  )
                  .subscribe(pupdate => dispatchFromUpdate(SyncState(pupdate)))
                return state
              }
              if (action.name === Router.SetRouteType &&
                  hooks.onRouteChanged) {
                hooks.onRouteChanged(cont.route, stateDispatcher)
              }
              return cont
            } catch (err) {
              onError(err as Error, stateDispatcher)
              return state
            }
          }
          return state
      }
  }

  // Initalize the store

  // const composeEnhancers =
  //   (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  //     (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  //       getMonitor: (monitor: any) => { setMonitor(monitor) }
  //     }) :
  //     compose

  const composeEnhancers =
    remoteDevTools
    ? composeWithDevTools(Object.assign(remoteDevTools, {realtime: true}))
    : (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        getMonitor: (monitor: any) => { setMonitor(monitor) }
      })
    : compose

  const isHotReloading = store ? true : false

  if (isHotReloading) {
    flagReplaying(true)
    store.replaceReducer(schedule)
    defer(() => flagReplaying(false))
  } else {
    store = createStore(
      schedule,
      initialState,
      composeEnhancers(
        applyMiddleware(dispatch as any)
      )
    )
    if (opts.onLoad) opts.onLoad()
  }

  class Index extends Component<any> {
    unloadRouter: () => void

    constructor(state: State & ActionDispatcher) {
      super(state)
      if (typeof (window as any).__REACT_HOT_LOADER__ !== "undefined") {
        (window as any).__REACT_HOT_LOADER__.warnings = false
      }
    }

    componentWillMount() {
      this.unloadRouter = Router.load(
        getRouteDispatch(getRootDispatcher(this.props.dispatch)),
        uriToRoute,
        routeToUri,
        baseUri,
        isHotReloading
      )
      if (!isHotReloading)
        this.props.dispatch(init)
    }

    componentWillUnmount() {
      this.unloadRouter()
    }

    render() {
      // Force TS to see RootJSXElement as an SFC due to this bug:
      // https://github.com/Microsoft/TypeScript/issues/15463

      const rootDispatcher = getRootDispatcher(this.props.dispatch)
      const Elem = RootView as any as
        (props: State & RootDispatcher<State, Route>) => JSX.Element
      return <Elem {...this.props as State} {...rootDispatcher} />
    }
  }

  const View = connect((s: any) => s)(Index)

  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <View />
      </Provider>
    </AppContainer>,
    rootHTMLElement
  )

  const mod = module as HotModule
  if (mod.hot) {
    mod.hot.accept()
    if (opts.onHMR) mod.hot.dispose(opts.onHMR())
  }
}

export interface HotModule extends NodeModule {
  hot: {
    accept: (file?: string, cb?: () => void) => void;
    dispose: (callback: () => void) => void;
  } | null
}

export const exists = (it: any) =>
  it !== undefined && it !== null

export function log<T>(value: T, ...others: any[]) {
  console.log(...others.concat(value))
  return value
}

// This is a bit of a hack, but useful
// https://github.com/Microsoft/TypeScript/issues/13723#issuecomment-275730246
export type Mutable<T extends { [x: string]: any }, K extends string> = {
  [P in K]: T[P];
}
