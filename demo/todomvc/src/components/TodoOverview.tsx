import * as React from "react";
import { collect } from "../../../../src";
import { subscribe } from "../../../../src/react";
import { ACTIVE_TODOS, COMPLETED_TODOS } from "../constants";
import { ITodoIdentifier, ITodoModel } from "../models/TodoModel";
import { TodoItem } from "./TodoItem";

export interface ITodoOverviewProps {
  todoFilter: string;
  activeTodoCount: number;
  todos: ITodoIdentifier[];
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
          {todos.map(todo => <TodoItem key={todo.value} todo={todo} />)}
        </ul>
      </section>
    );
  }

  toggleAll(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    this.props.toggleAll(checked);
  }
}

export const TodoOverview = subscribe(
  ["global", "ui/filter", "?todoFilter"],
  ["global", "activeCount", "?activeTodoCount"],
  collect("?todos", ["?e", "todo/visible", true]),
).then(({ todoFilter, activeTodoCount, todos }) => ({
  todoFilter,
  activeTodoCount,
  todos,

  toggleAll: (checked: boolean) => null,
}))(TodoOverviewPure);
