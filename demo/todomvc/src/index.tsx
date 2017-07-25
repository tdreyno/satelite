import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "../../../src/react";
import { TodoApp } from "./components/TodoApp";
import { ALL_TODOS } from "./constants";
import { assert, rete } from "./data";
import initializeRules from "./rules";

// Initial UI state
assert(["global", "ui/filter", ALL_TODOS]);

assert(["1", "todo/text", "Test"]);

// Apply static rules
initializeRules(rete);

ReactDOM.render(
  <Provider rete={rete}>
    <TodoApp />
  </Provider>,
  document.getElementById("todoapp"),
);
