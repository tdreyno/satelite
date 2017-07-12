import * as React from "react";
import * as ReactDOM from "react-dom";
import { Rete } from "../../../src";
import { Provider } from "../../../src/react";
import { TodoApp } from "./components/TodoApp";
import * as rules from "./rules";

const rete = Rete.create();

// Apply static rules
Object.keys(rules).forEach(ruleName => (rules as any)[ruleName](rete));

ReactDOM.render(
  <Provider rete={rete}>
    <TodoApp />
  </Provider>,
  document.getElementById("todoapp"),
);
