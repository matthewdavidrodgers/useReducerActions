import { useReducer, useMemo, useCallback } from "react";

function mapObject<O, MR>(obj: O, mapFn: (key: keyof O) => MR) {
  const mappingObj: Partial<{ [K in keyof O]: MR }> = {};
  for (let key in obj) {
    mappingObj[key as keyof O] = mapFn(key);
  }
  return mappingObj as { [K in keyof O]: MR };
}

/**
 * A type used to annotate the Action argument of your reducer actions. All actions with a payload must extend this type
 */
export type PayloadAction<P extends {}> = { payload: P };

type PayloadReducerActionCreator<
  S,
  A extends PayloadAction<any> = PayloadAction<any>
> = (state: S, action: A) => S;
type PayloadlessReducerActionCreator<S> = ((state: S) => S) | (() => S);
type ReducerAction<S> =
  | PayloadReducerActionCreator<S>
  | PayloadlessReducerActionCreator<S>;

export type ReducerObject<S = any> = {
  [K: string]: ReducerAction<S>;
};

type Action<
  R extends ReducerObject<any>,
  K extends keyof R = keyof R
> = R[K] extends (state: any, action: infer A) => void
  ? A extends PayloadAction<infer P>
    ? { type: K; payload: P }
    : { type: K }
  : { type: K };

type BoundPayloadAction<P> = (actionPayload: P) => void;
type BoundPayloadlessAction = () => void;
export type BoundActionObject<R extends ReducerObject<any>> = {
  [K in keyof R]: R[K] extends (state: any, action: infer A) => void
    ? A extends PayloadAction<infer P>
      ? BoundPayloadAction<P>
      : BoundPayloadlessAction
    : BoundPayloadlessAction;
};

/**
 * Describe state and its reducer-tight progressions through an object-based shorthand
 * @param reducerObject an object with reducer actions as values and the action names as its keys
 * @param initialState the default value of state
 * @returns {[State, BoundACtionObject]} a tuple of state and an object of directly callable actions
 */
export function useReducerActions<S, R extends ReducerObject<S>>(
  reducerObject: R,
  initialState: S
): [S, BoundActionObject<R>] {
  const reducer = useCallback(
    (state: S, action: Action<R>) => {
      return reducerObject[action.type](state, action as any);
    },
    [reducerObject]
  );
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions: any = useMemo(() => {
    return mapObject(reducerObject, key => (payload: any) => {
      let action: Action<R> = { type: key, payload } as any;
      return dispatch(action);
    });
  }, [reducerObject, dispatch]);

  return [state, actions];
}
