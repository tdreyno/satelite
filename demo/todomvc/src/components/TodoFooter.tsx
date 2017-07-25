import * as React from "react";
import { withHandlers } from "recompose";
import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS } from "../constants";
import {
  collect,
  IFact,
  placeholder as _,
  retract,
  subscribe,
  update,
} from "../data";
import { pluralize } from "../utils";

interface ITodoFooterProps {
  todoFilter: string;
  activeTodoCount: number;
  completedCount: number;
  completed: IFact[];
  clearCompleted: () => any;
  changeFilter: (filter: string) => any;
}

class TodoFooterPure extends React.Component<ITodoFooterProps> {
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

        {completedCount === 0
          ? null
          : <button
              className="clear-completed"
              onClick={this.clearCompleted.bind(this)}
            >
              Clear completed
            </button>}
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

export type ITodoFooterReteProps = Pick<
  ITodoFooterProps,
  "todoFilter" | "activeTodoCount" | "completedCount" | "completed"
>;

export type ITodoFooterHandlerProps = Pick<
  ITodoFooterProps,
  "clearCompleted" | "changeFilter"
>;

const TodoFooterWithHandlers = withHandlers<
  ITodoFooterHandlerProps,
  ITodoFooterReteProps
>({
  clearCompleted: ({ completed }) => () => retract(...completed),
  changeFilter: () => (f: string) => update(["global", "ui/filter", f]),
})(TodoFooterPure);

export const TodoFooter = subscribe(
  ["global", "ui/filter", "?todoFilter"],
  ["global", "doneCount", "?completedCount"],
  ["global", "activeCount", "?activeTodoCount"],
  collect("?completed", [_, "todo/completed", true]),
)(TodoFooterWithHandlers);
