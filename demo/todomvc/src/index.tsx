import * as React from "react";
import * as ReactDOM from "react-dom";
import { Rete } from "../../../src";
import { Provider } from "../../../src/react";
import { TodoApp } from "./components/TodoApp";
import { ALL_TODOS } from "./constants";
import * as rules from "./rules";

const rete = ((window as any).rete = Rete.create());

rete.assert(["global", "ui/filter", ALL_TODOS]);

rete.assert(["test", "todo/text", "Hello world"]);

// Apply static rules
Object.keys(rules).forEach(ruleName => (rules as any)[ruleName](rete));

ReactDOM.render(
  <Provider rete={rete}>
    <TodoApp />
  </Provider>,
  document.getElementById("todoapp"),
);
