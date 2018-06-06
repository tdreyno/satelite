import * as React from "react";
import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS } from "../../constants";
import { pluralize } from "../../utils";

export interface ITodoFooterProps<Schema> {
  todoFilter: string;
  activeTodoCount: number;
  completedCount: number;
  completed: Schema[];
  clearCompleted: () => any;
  changeFilter: (filter: string) => any;
}

export class TodoFooter<Schema> extends React.Component<
  ITodoFooterProps<Schema>
> {
  render() {
    const { activeTodoCount, completedCount } = this.props;

    if (!activeTodoCount && !completedCount) {
      return null;
    }

    const activeTodoWord = pluralize(activeTodoCount, "item");

    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{activeTodoCount}</strong> {activeTodoWord} left
        </span>
        <ul className="filters">
          {this.renderFilterLink(ALL_TODOS, "All")}
          {this.renderFilterLink(ACTIVE_TODOS, "Active")}
          {this.renderFilterLink(COMPLETED_TODOS, "Completed")}
        </ul>

        {completedCount === 0 ? null : (
          <button
            className="clear-completed"
            onClick={this.clearCompleted.bind(this)}
          >
            Clear completed
          </button>
        )}
      </footer>
    );
  }

  renderFilterLink(filterName: string, caption: string) {
    return (
      <li>
        <a
          onClick={() => this.props.changeFilter(filterName)}
          className={filterName === this.props.todoFilter ? "selected" : ""}
        >
          {caption}
        </a>{" "}
      </li>
    );
  }

  clearCompleted() {
    this.props.clearCompleted();
  }
}
