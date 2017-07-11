import * as React from "react";
import * as ReactDOM from "react-dom";
import { TodoApp } from "./components/TodoApp";
import { TodoStore } from "./stores/TodoStore";
import { ViewStore } from "./stores/ViewStore";

const todoStore = new TodoStore();
const viewStore = new ViewStore();

ReactDOM.render(
  <TodoApp todoStore={todoStore} viewStore={viewStore} />,
  document.getElementById("todoapp"),
);
