import List from "./list"
export type Nothing = null | undefined | void
export type Maybe<T> = T | Nothing
export type Type<T> = (x: T) => T
export type F1<A, B> = (x: A) => B

export interface DeepList<T> extends List<T | DeepList<T>> {}
export type Deep<T> = T | DeepList<T>

export interface DeepArray<T> extends List<T | DeepArray<T>> {}
export type DeepA<T> = T | DeepArray<T>
