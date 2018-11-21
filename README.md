# react-tooling
Tooling for React

# Motivation and architecture design

https://docs.google.com/document/d/1l5RW-zF2auaWf22yXKt94KsYQfOjj08IOuR3fK2r5iQ/edit?usp=sharing

# Installation
```sh
npm install react-tooling
```

# Try in sandbox

https://codesandbox.io/s/yvvwjj7olz
https://codesandbox.io/s/9omz7q7v94

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
