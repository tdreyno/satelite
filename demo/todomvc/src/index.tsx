import * as React from "react";
import * as ReactDOM from "react-dom";
import { Rete } from "../../../src";
import { Provider } from "../../../src/react";
import { TodoApp } from "./components/TodoApp";
import { ALL_TODOS } from "./constants";
import initializeRules from "./rules";

const rete = Rete.create({
  Asserting: console.log.bind(console),
  Retracting: console.log.bind(console),
  Updating: console.log.bind(console),
});

// Add to window for debugging
(window as any).rete = rete;

// Initial UI state
rete.assert(["global", "ui/filter", ALL_TODOS]);

rete.assert(["1", "todo/text", "Test"]);

// Apply static rules
initializeRules(rete);

ReactDOM.render(
  <Provider rete={rete}>
    <TodoApp />
  </Provider>,
  document.getElementById("todoapp"),
);
