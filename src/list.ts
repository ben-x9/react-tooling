import map from "lodash/map"
import find from "lodash/find"

type Selector<T> =
  Partial<T> |
  number |
  ((item: T, index: number, list: List<T>) => boolean)

const match = <T>(selector: Selector<T>, item: T, index: number, list: List<T>): boolean =>
  typeof selector === "number"
    ? selector === index :
  typeof selector === "function"
    ? selector(item, index, list)
    : propsMatch(item, selector)

const propsMatch = <U extends {}, T extends U>(record: T, partial: U) => {
  for (const key in partial) {
    if (partial[key] !== record[key]) {
      return false
    }
  }
  return true
}

const getNewValue = <T>(newValue: T | ((oldValue: T) => T), oldValue: T) =>
  typeof newValue === "function" ? newValue(oldValue) : newValue

const set = <T extends {}>(
    list: List<T>,
    where: Selector<T>,
    value: T | ((oldValue: T) => T)): List<T> =>
  map(
    list,
    (item, i) =>
      match(where, item, i, list)
        ? getNewValue(value, item)
        : item
  )

const get = <T extends {}>(list: List<T>, where: Partial<T>) =>
  find(list, item => propsMatch(item, where))

const reverse = <T>(list: List<T>): List<T> => list.slice().reverse()

const contains = <T>(list: List<T>, item: T) =>
  list.findIndex(x => x === item) >= 0

type List<T> = ReadonlyArray<T>
const List = {set, get, reverse, contains}

export default List
