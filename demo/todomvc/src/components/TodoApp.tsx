import * as React from "react";

import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS } from "../constants";
import { TodoEntry } from "./TodoEntry";
import { TodoFooter } from "./TodoFooter";
import { TodoOverview } from "./TodoOverview";

import { TodoStore } from "../stores/TodoStore";
import { ViewStore } from "../stores/ViewStore";

export class TodoApp extends React.Component<{
  viewStore: ViewStore,
  todoStore: TodoStore,
}> {
  render() {
    const {todoStore, viewStore} = this.props;
    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <TodoEntry todoStore={todoStore} />
        </header>
        <TodoOverview todoStore={todoStore} viewStore={viewStore} />
        <TodoFooter todoStore={todoStore} viewStore={viewStore} />
      </div>
    );
  }
}
