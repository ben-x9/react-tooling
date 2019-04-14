import {createBrowserHistory, createMemoryHistory} from "history"

export type HistoryAction = "PUSH" | "POP" | "REPLACE"
type Env = "Nodejs" | "Browser"

const env = (): Env =>
  typeof window !== "undefined" && typeof window.document !== "undefined"
    ? "Browser"
    : "Nodejs"

export const createHistory = () =>
  env() === "Browser" ? createBrowserHistory() : createMemoryHistory()
