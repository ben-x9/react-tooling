import {MiddlewareAPI, Dispatch, Action} from "redux"
import defer from "lodash/defer"

let _replaying = false
let _monitor: any = null

export const flagReplaying = (state: boolean) => _replaying = state
export const setMonitor = (monitor: any) => { _monitor = monitor }

export const isReplaying = (): boolean =>
  _replaying || _monitor && _monitor.isTimeTraveling()

export const dispatch = <S, A extends Action>(_: MiddlewareAPI<S>) =>
                                             (next: Dispatch<S>) =>
                                             (action: A) => {
  let syncActivityFinished = false
  let actionQueue: A[] = []

  const withDispatch = (action: A) =>
    Object.assign({}, action, {dispatchFromUpdate})

  function flushQueue() {
    // flush queue
    actionQueue = actionQueue.reduce((nextActionQueue, currentAction) => {
      next(currentAction)
      return nextActionQueue.slice(1)
    }, actionQueue)
  }

  function dispatchFromUpdate(action: A) {
    if (!isReplaying()) actionQueue.push(withDispatch(action))
    if (syncActivityFinished) defer(() => flushQueue())
  }

  const actionWithDispatch = withDispatch(action)

  next(actionWithDispatch)
  syncActivityFinished = true
  flushQueue()

  return actionWithDispatch
}

