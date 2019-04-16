import {isDispatchUpdate} from "./dispatcher"
import React from "react"

export type JSXElement = React.ReactElement<any>

export type View<State> =
  | ((state: State) => JSXElement)
  | {new (state: State): React.Component<State>}

const shallowEqual = (first: any, second: any, logDiff?: boolean): boolean =>
  Object.keys(first).every(key => {
    if (
      (first[key] && isDispatchUpdate(first[key])) ||
      typeof first[key] === "function"
    )
      return true
    if (logDiff && first[key] !== second[key])
      console.log("diff: ", first[key], second[key])
    return first[key] === second[key]
  })

export const memoizeComponent = <S>(
  view: View<S>,
  logDiff?: boolean
): View<S> => {
  const factory = React.createFactory(view as any)
  return class MemoizedComponent extends React.Component<S> {
    shouldComponentUpdate(nextProps: S) {
      return !shallowEqual(this.props, nextProps, logDiff)
    }

    render() {
      return factory(this.props as any)
    }
  }
}
