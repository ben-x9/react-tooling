import { MiddlewareAPI, Dispatch, Action } from "redux";
declare const dispatchMiddleware: <S, A extends Action>(store: MiddlewareAPI<S>) => (next: Dispatch<S>) => (action: A) => A & {
    dispatch: (action: A) => void;
};
export default dispatchMiddleware;
