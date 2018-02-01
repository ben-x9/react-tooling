import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import { createStore, applyMiddleware, compose } from "redux"
import { Provider, connect } from "react-redux"
import { AppContainer } from "react-hot-loader"
import dispatch from "./dispatchMiddleware"
import * as Router from "./router"
import { RouteToUri, UriToRoute } from "./router"
import EditableText from "./EditableText"

export { React, EditableText, JSX }

export type AnyAction = Redux.Action

export type Dispatch = <A extends Redux.Action, E>(action: A, e?: React.SyntheticEvent<E>) => A

export type Dispatcher = {dispatch: Dispatch}

export class Component<P> extends React.PureComponent<P & Dispatcher> {
  constructor(props: P & Dispatcher) {
    super(props)
    this.dispatch = this.dispatch.bind(this)
  }

  dispatch<A extends Redux.Action, E>(
           action: A,
           eventToStop?: React.SyntheticEvent<E>) {
    if (eventToStop) eventToStop.stopPropagation()
    return this.props.dispatch(action)
  }
}

export type Goto<Route> = Router.Action<Route>
export type GotoType = Router.ActionType
export const GotoType = Router.ActionType.Goto
export const goto = Router.goto

export type Update<State, Action> = (state: State, action: Action) => State

let store: Redux.Store<any>

export const load = function
    <State extends Router.State<Route>,
     Action extends Redux.Action,
     Route>(
    RootJSXElement:
      ((state: State) => JSX.Element) |
      { new(state: State & Dispatcher): Component<State> },
    update: Update<State, Action>,
    routeToUri: RouteToUri<Route>,
    uriToRoute: UriToRoute<Route>,
    module: NodeModule,
    rootHTMLElement= document.body.firstElementChild) {

  const wrappedUpdate = (state: State, action: Action) => {
    let newState = state as Router.State<Route>
    if (Router.reactsTo<Route>(action)) {
       newState = Router.update(
        state,
        action,
        routeToUri
      )
    }
    return update(newState as State, action)
  }

  // Initalize the store

  const composeEnhancers = (window as any).
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  if (store) {
    store.replaceReducer(wrappedUpdate)
  } else {
    store = createStore(
      wrappedUpdate,
      composeEnhancers(applyMiddleware(dispatch))
    )
  }

  class Index extends Component<any> {
    unloadRouter: () => void

    constructor(state: State & Dispatcher) {
      super(state)
      if (typeof (window as any).__REACT_HOT_LOADER__ !== "undefined") {
        (window as any).__REACT_HOT_LOADER__.warnings = false
      }
    }

    componentWillMount() {
      this.unloadRouter = Router.load(
        this.props.dispatch,
        uriToRoute
      )
    }

    componentWillUnmount() {
      this.unloadRouter()
    }

    render() {
      // Force TS to see RootJSXElement as an SFC due to this bug:
      // https://github.com/Microsoft/TypeScript/issues/15463
      const Elem = RootJSXElement as any as (state: State) => JSX.Element
      return <Elem {...this.props as State}/>
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
  if (mod.hot) mod.hot.accept()
}

export interface HotModule extends NodeModule {
  hot: {
    accept: (file?: string, cb?: () => void) => void;
    dispose: (callback: () => void) => void;
  } | null
}

export type Nothing = null | undefined | void
export type Maybe<T> = T | Nothing
export type List<T> = ReadonlyArray<T>
export type Type<T> = (x: T) => T
}

export type Nothing = null | undefined | void
export type Maybe<T> = T | Nothing
export type List<T> = ReadonlyArray<T>
export type Type<T> = (x: T) => T


/* Wrap component update funtions in tests so we can leave out the dispatch
   parameter */

const actionWithDispatch = <A extends AnyAction>(action: A): A & Dispatcher =>
  Object.assign({}, action, {
    dispatch<A extends AnyAction>(a: A) {
      return a
    }
  })

type UpdateFn<S, A extends AnyAction> = (state: S, action: A & Dispatcher) => S
export type WrappedUpdateFn<S, A extends AnyAction> = (state: S, action: A) => S

export const withDispatch =
  <S, A extends AnyAction> (f: UpdateFn<S, A>): WrappedUpdateFn<S, A> =>
    (state, action) => f(state, actionWithDispatch(action))
