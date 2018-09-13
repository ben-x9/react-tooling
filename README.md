# react-tooling
Tooling for React

# Motivation and architecture design

https://docs.google.com/document/d/1l5RW-zF2auaWf22yXKt94KsYQfOjj08IOuR3fK2r5iQ/edit?usp=sharing

# Installation
```sh
npm install react-tooling
```

# Basic usage

```tsx

import {load} from "react-tooling"

type F1<A, B> = (a: A) => B
type Route = Home
interface Home {
  type: RouteType.Home
}
const home: Home = {type: RouteType.Home}

// convert a route to string path
const toUri = (route: Route): string => ""
// convert an string path to a route
const fromUri = (path: string): Route => home

// The application state
interface State {
  route: Route
  text: string
}
const State = {
  route: home
  text: "Test"
}

// sync task
const updateText = (newText: string) => (state: State): State => ({
  ...state,
  text: newText
})

// Example with async task
const updateTextAsync = (newText: string) => (state: State): Promise<F1<State, State>> =>
  Promise.resolve((state) => ({...state, text: newText}))

// Application view
const View = ({
  dispatch,
  setRoute,
  ...state
}: State & RootDispatcher<State, Route>): JSX.Element => {
    return (
      <div>
        {state.text}
        <button onClick={dispatch(updateText("clicked"))}>Update name</button>
        <button onClick={dispatch(updateTextAsync("Clicked async"))}></button>
      </div>
    )
  }
}

load(
  State,
  View,
  toUri,
  fromUri,
  module,
  {}
)
```

More advanced demo can be found at this repository https://github.com/ben-x9/react-tooling-demo/tree/with-new-react-tooling

# API Documentation

## Load

Load an application with an initial state and a react component

```ts
<State extends Router.State<Route>, Route>(
    initialState: State,
    RootView: RootView<State, Route>,
    routeToUri: RouteToUri<Route>,
    uriToRoute: UriToRoute<Route>,
    module: NodeModule,
    hooks: AppHooks<State, Route> = {},
    opts: Opts = defaultOpts) => void
    
 ```
 
## createDispatch

Allow to create a dispatch function for an inner property of the state.
Useful for updating a child state

```ts
type F1<A, B> = (a: A) => B
type Curried<A, B, C> = (a: A) => (b: B) => C
type Continuation<S> = S | Promise<F1<S, S>> | Observable<F1<S, S>>
type UpdateF<S> = F1<S, Continuation<S>>
type DispatchUpdate<S> = (
  update: UpdateF<S>,
  name?: string,
  noReplay?: boolean
) => void
type GetAndSet<S, S1> = {
  get: F1<S, S1>
  set: Curried<S1, S, S>
}

<S, S1>(
  parentDispatch: DispatchUpdate<S>,
  lens: GetAndSet<S, S1>
): DispatchUpdate<S1>
```
