import {Dispatcher, isDispatchUpdate} from "./dispatcher"
import React from "react"

export type JSXElement = React.ReactElement<any>

export type View<State> =
  | ((state: State) => JSXElement)
  | {new (state: State & Dispatcher<State>): React.Component<State>}

const shallowEqual = (first: any, second: any): boolean =>
  Object.keys(first).every(key => {
    if (first[key] && isDispatchUpdate(first[key])) return true
    return first[key] === second[key]
  })

export const memoizeComponent = <S>(view: View<S>): View<S> => {
  const factory = React.createFactory(view as any)
  return class MemoizedComponent extends React.Component<S> {
    shouldComponentUpdate(nextProps: S) {
      return !shallowEqual(this.props, nextProps)
    }

    render() {
      return factory(this.props as any)
    }
  }
}
