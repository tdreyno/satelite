import * as React from "react";
import * as ReactDOM from "react-dom";
import { Rete } from "../../../src";
import { Provider } from "../../../src/react";
import { TodoApp } from "./components/TodoApp";

const { self: rete } = Rete.create();

ReactDOM.render(
  <Provider rete={rete}>
    <TodoApp />
  </Provider>,
  document.getElementById("todoapp"),
);
