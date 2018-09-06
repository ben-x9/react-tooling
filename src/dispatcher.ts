import {F1, Curried} from "functools-ts"
import * as Redux from "redux"
import {Observable} from "rxjs"
import {map} from "rxjs/operators"

export const UpdateStateType = "UpdateState"
export type Continuation<S> = S | Promise<F1<S, S>> | Observable<F1<S, S>>
export type UpdateF<S> = F1<S, Continuation<S>> & {noReplay?: boolean}
export interface UpdateState<S> {
  type: "UpdateState"
  update: UpdateF<S>
  debugInfo: string
  noReplay: boolean
}
export type DispatchUpdate<S1> = (
  update: UpdateF<S1>,
  name?: string,
  noReplay?: boolean
) => void
export type UpdateFOpts = {
  name?: string
  noReplay?: boolean
}
export type Dispatcher<S> = {
  dispatch: DispatchUpdate<S>
}
export type Get<S, S1> = F1<S, S1>
export type Set<S, S1> = Curried<S1, S, S>
export const SyncState = <S>(f: F1<S, S>): UpdateState<S> =>
  UpdateState(f, "SyncState")

const UpdateState = <S>(
  update: UpdateF<S>,
  debugInfo: string,
  noReplay: boolean = false
): UpdateState<S> => ({
  type: UpdateStateType,
  update,
  debugInfo,
  noReplay: noReplay
})

export type ActionDispatch = <E>(
  action: Redux.Action,
  eventToStop?: React.SyntheticEvent<E> | Event) => void

export const isPromise = <S>(c: Continuation<S>): c is Promise<F1<S, S>> =>
  (c as any).then ? true : false

export const isObservable = <S>(
  c: Continuation<S>
): c is Observable<F1<S, S>> => ((c as any).subscribe ? true : false)

export const createFromReduxDispatch = <S>(
  dispatch: ActionDispatch
): DispatchUpdate<S> => (
  update: UpdateF<S>,
  name?: string,
  noReplay?: boolean
) => {
  const action = UpdateState(update, name ? name : "", noReplay ? true : false)
  dispatch(action)
}

export const noReplay = <S>(update: UpdateF<S>): UpdateF<S> => {
  update.noReplay = true
  return update
}

export type GetAndSet<S, S1> = {
  get: Get<S, S1>
  set: Set<S, S1>
}

export const createDispatch = <S, S1>(
  parentDispatch: DispatchUpdate<S>,
  lens: GetAndSet<S, S1>
): DispatchUpdate<S1> => (
  update: UpdateF<S1>,
  name?: string,
  noReplay?: boolean
) => {
  parentDispatch(
    state => {
      const cont = update(lens.get(state))
      if (isPromise(cont))
        return cont.then(pupdate => (state: S) =>
          lens.set(pupdate(lens.get(state)))(state)
        )
      else if (isObservable(cont)) {
        return cont.pipe(
          map(pupdate => (state: S) => {
            const newS1 = pupdate(lens.get(state))
            return lens.set(newS1)(state)
          })
        )
      }
      return lens.set(cont)(state)
    },
    update.name ? update.name : name,
    update.noReplay ? update.noReplay : noReplay
  )
}
