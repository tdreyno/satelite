import * as React from "react";
import { inject } from "../../../../src/react";
import { ACTIVE_TODOS, COMPLETED_TODOS } from "../constants";
import {
  activeTodoCount,
  ITodoIdentifier,
  ITodoModel,
  todoFilter,
} from "../models/TodoModel";
import { TodoItem } from "./TodoItem";

export interface ITodoOverviewProps {
  todoFilter: string;
  activeTodoCount: number;
  todos: ITodoIdentifier[];
  completedTodos: ITodoIdentifier[];
  toggleAll: (checked: boolean) => any;
}

class TodoOverviewPure extends React.Component<ITodoOverviewProps> {
  render() {
    const { activeTodoCount, todos } = this.props;
    if (todos.length === 0) {
      return null;
    }
    return (
      <section className="main">
        <input
          className="toggle-all"
          type="checkbox"
          onChange={this.toggleAll.bind(this)}
          checked={activeTodoCount === 0}
        />
        <ul className="todo-list">
          {this.getVisibleTodos().map(todo =>
            <TodoItem key={todo.value} todo={todo} />,
          )}
        </ul>
      </section>
    );
  }

  getVisibleTodos() {
    const { completedTodos, todos, todoFilter } = this.props;

    return todos.filter(todo => {
      switch (todoFilter) {
        case ACTIVE_TODOS:
          return completedTodos.indexOf(todo) === -1;
        case COMPLETED_TODOS:
          return completedTodos.indexOf(todo) !== -1;
        default:
          return true;
      }
    });
  }

  toggleAll(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    this.props.toggleAll(checked);
  }
}

export const TodoOverview = inject(({ self, findAll, removeFact, _ }) => {
  const todos = findAll(["global", "todos", "?v"]).map(({ v }) => v);

  return {
    todoFilter: todoFilter(self),
    completedTodos: findAll(["?e", "todo/completed", true]).map(({ e }) => e),
    activeTodoCount: activeTodoCount(self),
    todos,
    toggleAll: (checked: boolean) => null,
  };
})(TodoOverviewPure);
