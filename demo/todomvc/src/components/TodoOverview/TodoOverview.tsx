import * as React from "react";
import map = require("lodash/map");
import { TodoItem } from "../TodoItem";

export interface ITodoOverviewProps {
  todoFilter: string;
  activeTodoCount: number;
  todoIds: string[];
  allIds: string[];
  toggleAll: (checked: boolean) => any;
}

export class TodoOverview extends React.Component<ITodoOverviewProps> {
  render() {
    const { activeTodoCount, todoIds } = this.props;

    if (todoIds.length === 0) {
      return null;
    }

    return (
      <section className="main">
        <input
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
          onChange={this.toggleAll.bind(this)}
          checked={activeTodoCount === 0}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {map(todoIds, id => <TodoItem key={id} todoId={id} />)}
        </ul>
      </section>
    );
  }

  toggleAll(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    this.props.toggleAll(checked);
  }
}
