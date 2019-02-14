import { UpdateF, Dispatch, isPromise } from "./dispatcher";
import { isObservable } from "rxjs";


const stateTransition = <S>(
  ...transitions: UpdateF<S>[]
) => (dispatch: Dispatch<S>): void => {
  const currentTransition = transitions[0]
  dispatch((state: S) => {
    const res = currentTransition(state)
    if (isPromise(res)) {
      res.then((nextState) => {
        dispatch(nextState)
        stateTransition(...transitions.slice(1))(dispatch)
      })
         .catch((err) => {throw err})
      return state
    }
    else if (isObservable(res)) {
      res.subscribe({
        next: (nextState) => dispatch(nextState),
        complete: () =>
          stateTransition(...transitions.slice(1))(dispatch),
        error: (error) => {
          throw error
        }
      })
      return state
    } else {
      stateTransition(...transitions.slice(1))(dispatch)
      return res
    }
  })
}