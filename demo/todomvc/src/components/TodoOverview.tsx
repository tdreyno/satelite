import * as React from "react";
import { collect, IFact } from "../../../../src";
import { subscribe } from "../../../../src/react";
import { TodoItem } from "./TodoItem";

export interface ITodoOverviewProps {
  todoFilter: string;
  activeTodoCount: number;
  todoIds: string[];
  toggleAll: (checked: boolean) => any;
}

class TodoOverviewPure extends React.Component<ITodoOverviewProps> {
  render() {
    const { activeTodoCount, todoIds } = this.props;

    if (todoIds.length === 0) {
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
          {todoIds.map(id => <TodoItem key={id} todoId={id} />)}
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
).then(
  ({
    todoFilter,
    activeTodoCount,
    todos,
  }: {
    todoFilter: string;
    activeTodoCount: number;
    todos: IFact[];
  }) => {
    return {
      todoFilter,
      activeTodoCount,
      todoIds: todos ? todos.map(([id]) => id) : [],

      // Actions
      toggleAll: (checked: boolean) => {
        if (checked) {
          // set all todos to completed
        } else {
          // clear all completed
        }
      },
    };
  },
)(TodoOverviewPure);
