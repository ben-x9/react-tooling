# react-tooling
Tooling for React

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

const toUri = (route: Route): string => ""
const fromUri = (uri: string): Route => home

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
  module
)
```

More advanced demo can be found at this repository https://github.com/ben-x9/react-tooling-demo/tree/with-new-react-tooling
