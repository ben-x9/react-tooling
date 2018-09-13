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
import "react-hot-loader/patch";
import { load, React, RootDispatcher } from "react-tooling";
import { F1 } from "functools-ts";

enum RouteType {
  Home = "Home"
}
interface Home {
  type: RouteType.Home;
}
const Home: Home = { type: RouteType.Home };
type Route = Home;

const toUri = (route: Route): string => "";
const fromUri = (uri: string): Route => Home;

interface State {
  route: Route;
  text: string;
}
const State: State = {
  route: Home,
  text: "hello"
};

const setText = (text: string) => (state: State): State => ({
  ...state,
  text
});

const setTextAsync = (text: string) => (
  state: State
): Promise<F1<State, State>> => Promise.resolve(state => ({ ...state, text }));

type ViewProps = State & RootDispatcher<State, Route>;
const View = ({ dispatch, setRoute, ...state }: ViewProps): JSX.Element => (
  <div>
    <button onClick={() => dispatch(setText("Hello sync"))}>
      Update text sync
    </button>
    <button onClick={() => dispatch(setTextAsync("Hello async"))}>
      Update text async
    </button>
    {state.text}
  </div>
);

load(
  State,
  View,
  toUri,
  fromUri,
  module,
  {},
  {
    rootHTMLElement: document.getElementById("root")
  }
);
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
