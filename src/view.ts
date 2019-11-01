import {isDispatch} from "hydra-dispatch"
import React from "react"
import { F2 } from "functools-ts"
// import {F2} from "functools-ts"

export type JSXElement = React.ReactElement<any>

export type View<State> =
  | ((state: State) => JSXElement)
  | {new (state: State): React.Component<State>}

export const shallowEqual = (first: any, second: any, logDiff?: boolean): boolean =>
  Object.keys(first).every(key => {
    if (
      (first[key] && isDispatch(first[key])) ||
      typeof first[key] === "function"
    )
      return true
    if (logDiff && first[key] !== second[key])
      console.log(`diff: ${key}`, first[key], second[key])
    return first[key] === second[key]
  })

export const memoizeComponent = <S>(
  view: View<S>,
  logDiff?: boolean,
  compare?: F2<S, S, boolean>
): View<S> => {
  const factory = React.createFactory(view as any)
  return class MemoizedComponent extends React.Component<S> {
    shouldComponentUpdate(nextProps: S) {
      if (compare)
        return !compare(this.props, nextProps)
      return !shallowEqual(this.props, nextProps, logDiff)
    }

    render() {
      return factory(this.props as any)
    }
  }
}
