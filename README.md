# useReducerActions

A react hook that wraps `useReducer` and provides an object-based shorthand inspired by the `createSlice()` api in [redux toolkit](https://github.com/reduxjs/redux-toolkit)

## Installation

Install to your project via `yarn add use-reducer-actions` or `npm install use-reducer-actions`

## Usage

Utilize the explicit state behavior of useReducer with a typesafe object syntax

First, define your state and initial state
```typescript
type State = {
  loading: boolean,
  values: string[]
}

let initialState: State = {
  loading: false,
  values: []
}
```

Next, define your `reducer object`, and object with keys as "action titles" and values as "reducer actions". Essentially, you describe what the generated reducer will do (the reducer action) when the specified action (the action title) case is passed.

```tsx
import { PayloadAction } from "use-reducer-actions";

const reducerObject = {
  reset: () => {
    return initialState;
  },
  append: (state: State, action: PayloadAction<string>) => {
    return {
      ...state,
      values: state.values.concat(action.payload)
    };
  },
  pop: (state: State) => {
    let newValues = state.values.slice(0, state.values.length - 1);
    return {
      ...state,
      values: newValues
    };
  }
}
```

Now you can use your stateful logic as easily invoked actions - no need to call a dispatch function. All together now:

```tsx
import React from "react";
import { useReducerActions, PayloadAction } from "use-reducer-actions";

type State = {
  loading: boolean,
  values: string[]
}

let initialState: State = {
  loading: false,
  values: []
}

const reducerObject = {
  reset: () => {
    return initialState;
  },
  append: (state: State, action: PayloadAction<string>) => {
    return {
      ...state,
      values: state.values.concat(action.payload)
    };
  },
  pop: (state: State) => {
    let newValues = state.values.slice(0, state.values.length - 1);
    return {
      ...state,
      values: newValues
    };
  }
}

const MyComponent: React.FC = () => {
  const [state, actions] = useReducerActions(reducerObject, initialState);

  return (
    <div>
      My values: {state.values.join(", ")}
    </div>
    <div>
      <button onClick={() => actions.append(`value ${state.values.length}`)}>
        Append Value
      </button>
      <button onClick={() => actions.pop()}>
        Pop Value
      </button>
      <button onClick={() => actions.reset()}>
        Reset
      </button>
    </div>
  )
}

```

## Tips

To avoid referential equality issues (which may cause unnecessary rerenders), it is recommended to define your reducer object outside your component. If your reducer object is dependent on state or props and you must define it in your component, consider wrapping it in useMemo.

To allow typescript to fully infer your actions, do not annotate your reducer object with a type.

```typescript
// this is bad; it will prevent accurate type inference
const reducer: Record<string, (state: S, action: A) => void> = {
  reset: () => initialState,
  append: (state, action) => {
    return { ...state, values: state.values.concat(action.payload.value) };
  }
}
``` 
Instead, annotate the reducer action functions inside. Typescript will then infer action names and typings.

```typescript
// this is what we want
const reducer = {
  reset: () => initialState,
  append: (state: S, action: PayloadAction<{ value: string }>) => {
    return { ...state, values: state.values.concat(action.payload.value) };
  }
}
``` 

You may have to pass generics to useReducerActions to help out when state is very tightly defined. Using `typeof {your reducer object}` can do most of the heavy lifting when it comes to type inference.
```typescript
const [state, actions] = useReducerActions<State, typeof reducerObject>(reducerObject, initialState);
```

## Future Work

It could be nice to include [Immer](https://github.com/immerjs/immer) in the same way that redux-toolkit does, but as a feature this is fairly low priority for me.

Typings can get out of sync quite quickly. And when the reducer object is defined outside of its usage in the component, the errors can be hard to read. It may be useful to define a "higher-order hook" - a function that you call outside of a component that returns a hook that is bound to you reducerObject and initialState, much like the original `createSlice()` api does. That way at the very least type inference may be more intuitive, no need to use `typeof {your reducer object}` in a generic.

## Limitations

While the typings are complete, there are two uses of `any` in the implementation of the declarations (meaning the javascript can't quite link up the typings). While one of the instances is definitely due to the complexities of "mapping" an object via its keys in javascript, the other I'm less sure of. Hopefully these can evolve out, but it is possible there are small bugs due to these typing issues.

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

