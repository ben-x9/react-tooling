export type Nothing = null | undefined | void
export type Maybe<T> = T | Nothing
export type Type<T> = (x: T) => T
export type List<T> = ReadonlyArray<T>
