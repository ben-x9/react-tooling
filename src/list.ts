const propsMatch = <T extends {}, U extends T>(a: U, b: T) => {
  for (const key in b) {
    if (b[key] !== a[key]) {
      return false
    }
  }
  return true
}

const getNewValue = <T>(newValue: T | ((oldValue: T) => T), oldValue: T) =>
  typeof newValue === "function" ? newValue(oldValue) : newValue

const set = <T extends {}>(list: List<T>,
                           where: Partial<T>,
                           value: T | ((oldValue: T) => T)): List<T> =>
  list.map(item => propsMatch(item, where) ? getNewValue(value, item) : item)

const get = <T extends {}>(list: List<T>, where: Partial<T>) =>
  list.find(item => propsMatch(item, where))

type List<T> = ReadonlyArray<T>
const List = { set, get }

export default List
