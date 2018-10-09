import {F1, Curried} from "functools-ts"
import * as Redux from "redux"
import {Observable} from "rxjs"
import {map} from "rxjs/operators"

export type Continuation<S> = S | Promise<F1<S, S>> | Observable<F1<S, S>>
export type UpdateF<S> = F1<S, Continuation<S>> & {noReplay?: boolean}
export interface UpdateState<S> {
  type: string
  update: UpdateF<S>
  name: string
  noReplay: boolean
}
const DispatchUpdateSymbol = Symbol("DispatchUpdate")

export type DispatchUpdate<S1> = ((
  update: UpdateF<S1>,
  name?: string,
  noReplay?: boolean
) => void) & {[DispatchUpdateSymbol]: boolean}
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
  name: string,
  noReplay: boolean = false
): UpdateState<S> => ({
  type: name ? name : "UpdateState",
  update,
  name,
  noReplay: noReplay
})

export type ActionDispatch = <E>(
  action: Redux.Action,
  eventToStop?: React.SyntheticEvent<E> | Event) => void

export const isPromise = <S>(c: Continuation<S>): c is Promise<F1<S, S>> =>
  !!(c as any).then

export const isObservable = <S>(
  c: Continuation<S>
): c is Observable<F1<S, S>> => !!((c as any).subscribe)

export const isUpdateState = <S>(action: Redux.Action): action is UpdateState<S> =>
  !!(action as any).update


export const isDispatchUpdate = <S>(obj: any): obj is DispatchUpdate<S> =>
  !!obj[DispatchUpdateSymbol]

export const createFromReduxDispatch = <S>(
  dispatch: ActionDispatch
): DispatchUpdate<S> => {
  let dispatchUpdate = ((
    update: UpdateF<S>,
    name?: string,
    noReplay?: boolean
  ) => {
    const action = UpdateState(update, name ? name : "", noReplay ? true : false)
    dispatch(action)
  }) as DispatchUpdate<S>
  dispatchUpdate[DispatchUpdateSymbol] = true
  return dispatchUpdate
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
): DispatchUpdate<S1> => {
  let dispatchUpdate = ((
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
      name ? name : update.name,
      noReplay ? noReplay : update.noReplay
    )
  }) as any as DispatchUpdate<S1>
  dispatchUpdate[DispatchUpdateSymbol] = true
  return dispatchUpdate
}