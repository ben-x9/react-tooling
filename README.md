# react-tooling
Tooling for React

# Installation
```sh
npm install react-tooling
```

# Basic usage

```tsx

import * as Root from "Root"
import {load} from "react-tooling"
import {toUri, fromUri} from "routes"

type Route = Home | Play | NotFound
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

const updateName = (newTest: string) => (state: State): State => ({
  ...state,
  text: newText
})

const View = ({
  dispatch,
  setRoute,
  ...state
}: State & RootDispatcher<State, Route>): JSX.Element => {
    return (
      <div onClick={() => dispatch(updateName("Clicked"))}>{state.text}</div>
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

More advanced demo can be found at this repository https://github.com/ben-x9/react-tooling-demo
