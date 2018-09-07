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
interface NotFound {
  type: RouteType.NotFound
}
const notFound: NotFound =
  {type: RouteType.NotFound}

const toUri = (route: Route): string => {
  switch (route.type) {
    case RouteType.Home:
      return ""
    case RouteType.NotFound:
      return "not-found"
  }
}

const fromUri = (uri: string): Route => {
  if (uri === "") {
    return home
  } else {
    return notFound
  }
}

interface State {
  name: string
}
const State = {
  name: "Test"
}

const updateName = (name: string) => (state: State): State => ({
  ...state,
  name
})

const View = ({
  dispatch,
  setRoute,
  ...state
}: State & RootDispatcher<State, Route>): JSX.Element => {
  switch (state.route.type) {
    case RouteType.NotFound:
      return <div>Not found</div>
    case RouteType.Home:
      return (
        <div onClick={() => dispatch(updateName("Clicked"))}>{state.name}</div>
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
