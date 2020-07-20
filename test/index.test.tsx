import React from "react";
import * as ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { useReducerActions, PayloadAction } from "../src";

let root = document.createElement("div");
root.setAttribute("id", "root");
document.body.appendChild(root);

type State = {
  values: string[];
  combined: string;
}

const initialState: State = {
  values: [],
  combined: ""
};

const reducer = {
  reset: () => initialState,
  append: (state: State, action: PayloadAction<string>) => {
    let newValues = state.values.concat(action.payload);
    return { values: newValues, combined: newValues.join(", ") };
  },
  pop: (state: State) => {
    let newValues = state.values.slice(0, state.values.length - 1);
    return { values: newValues, combined: newValues.join(", ") };
  }
}

const TestComponent: React.FC = () => {
  const [state, actions] = useReducerActions(reducer, initialState);

  return (
    <div>
      <div>
        <span>Values: </span>
        <span id="value">{state.combined}</span>
      </div>
      <div>
        <button id="append" onClick={() => actions.append({ payload: "value" })}>Append</button>
        <button id="pop" onClick={() => actions.pop()}>Pop</button>
        <button id="reset" onClick={() => actions.reset()}>Reset</button>
      </div>
    </div>
  );
}

test("can use bound actions without wrapping in dispatch", () => {
  ReactDOM.render(<TestComponent />, document.querySelector("#root"));

  let value = document.querySelector("#value");
  let appendBtn = document.querySelector("#append") as HTMLButtonElement;
  let popBtn: HTMLButtonElement = document.querySelector("#pop") as HTMLButtonElement;
  let resetBtn: HTMLButtonElement = document.querySelector("#reset") as HTMLButtonElement;

  expect(value?.textContent).toEqual("");

  act(() => {
    appendBtn.click();
  });

  expect(value?.textContent).toEqual("value");

  act(() => {
    appendBtn.click();
  });

  expect(value?.textContent).toEqual("value, value");

  act(() => {
    popBtn.click();
  });

  expect(value?.textContent).toEqual("value");

  act(() => {
    resetBtn.click();
  });

  expect(value?.textContent).toEqual("");
});