import { MiddlewareAPI, Dispatch, Action } from "redux"
import { defer } from "lodash"

const dispatchMiddleware = <S, A extends Action>(store: MiddlewareAPI<S>) =>
                                                (next: Dispatch<S>) =>
                                                (action: A) => {
  let syncActivityFinished = false
  let actionQueue: any[] = []

  function flushQueue() {
    actionQueue.forEach(a => store.dispatch(a)) // flush queue
    actionQueue = []
  }

  function dispatch(action: A) {
    actionQueue = actionQueue.concat([action])
    if (syncActivityFinished) {
      defer(() => flushQueue())
    }
  }

  const actionWithDispatch = Object.assign({}, action, { dispatch })

  next(actionWithDispatch)
  syncActivityFinished = true
  flushQueue()

  return actionWithDispatch
}

export default dispatchMiddleware
