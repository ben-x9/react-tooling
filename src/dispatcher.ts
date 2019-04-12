import {F1, Curried, List} from "functools-ts"
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
export const DispatchUpdateSymbol = Symbol("DispatchUpdate")

export type Dispatch<S1> = ((
  update: UpdateF<S1>,
  name?: string,
  noReplay?: boolean
) => void) & {[DispatchUpdateSymbol]: boolean}
export type UpdateFOpts = {
  name?: string
  noReplay?: boolean
}
export type Dispatcher<S> = {
  dispatch: Dispatch<S>
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
  eventToStop?: React.SyntheticEvent<E> | Event
) => void

export const isPromise = <S>(c: Continuation<S>): c is Promise<F1<S, S>> =>
  !!(c as any).then

export const isObservable = <S>(
  c: Continuation<S>
): c is Observable<F1<S, S>> => !!(c as any).subscribe

export const isUpdateState = <S>(
  action: Redux.Action
): action is UpdateState<S> => !!(action as any).update

export const isDispatchUpdate = <S>(obj: any): obj is Dispatch<S> =>
  !!obj[DispatchUpdateSymbol]

export const dispatcherFromReact = <S>(setState: (state: S | F1<S, S>) => void): Dispatch<S> => {
  let dispatch = ((
    updateFn: UpdateF<S>,
    _name?: string,
    _noReplay?: boolean
  ) => {
    setState((state: S) => {
      const ret = updateFn(state)
      if (isPromise(ret)) {
        ret.then(d => setState((state: S) => d(state)))
        return state
      } else if (isObservable(ret)) {
        ret.subscribe(d => setState((state: S) => d(state)))
        return state
      } else {
        return ret
      }
    })
  }) as Dispatch<S>
  dispatch[DispatchUpdateSymbol] = true
  return dispatch
}

export const dispatcherFromRedux = <S>(
  dispatch: ActionDispatch
): Dispatch<S> => {
  let dispatchUpdate = ((
    update: UpdateF<S>,
    name?: string,
    noReplay?: boolean
  ) => {
    const action = UpdateState(
      update,
      name ? name : "",
      noReplay ? true : false
    )
    dispatch(action)
  }) as Dispatch<S>
  dispatchUpdate[DispatchUpdateSymbol] = true
  return dispatchUpdate
}

export const nullDispatch = ((_: UpdateF<any>) => {}) as Dispatch<any>
nullDispatch[DispatchUpdateSymbol] = true

export const noReplay = <S>(update: UpdateF<S>): UpdateF<S> => {
  update.noReplay = true
  return update
}

export type GetAndSet<S, S1> = {
  get: Get<S, S1>
  set: Set<S, S1>
}

export const createDispatch = <S, S1>(
  parentDispatch: Dispatch<S>,
  lens: GetAndSet<S, S1>
): Dispatch<S1> => {
  let dispatchUpdate = (((
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
  }) as any) as Dispatch<S1>
  dispatchUpdate[DispatchUpdateSymbol] = true
  return dispatchUpdate
}

export const createDispatchFromProp = <S, K extends keyof S>(
  parentDispatch: Dispatch<S>,
  key: K
): Dispatch<S[K]> =>
  createDispatch(
    parentDispatch, {
      get: s => s[key],
      set: s1 => s => ({
        ...s,
        [key]: s1
      })
    }
  )

export const createDispatchFromIndex = <S, S1, K extends keyof S>(parendDispatch: Dispatch<S>, key: K, idx: number): Dispatch<S1> =>
  createDispatch(
    parendDispatch,
    {
      get: (state) => (state[key] as any)[idx],
      set: (item) => state => ({
        ...state,
        [key]: List.set(state[key] as any, idx, item)
      })
    }
  )