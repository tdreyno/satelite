import * as React from "react";
import { collect, placeholder as _ } from "../../../../src";
import { subscribe } from "../../../../src/react";
import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS } from "../constants";
import { pluralize } from "../utils";

class TodoFooterPure extends React.Component<{
  todoFilter: string;
  activeTodoCount: number;
  completedCount: number;
  clearCompleted: () => any;
  changeFilter: (filter: string) => any;
}> {
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

export const TodoFooter = subscribe(
  // TODO: Figure out accumulator subnetworks with zero matches
  collect("?completed", [_, "todo/completed", true]),
  ["global", "ui/filter", "?filter"],
  ["global", "doneCount", "?done"],
  ["global", "activeCount", "?active"],
).then(({ filter, done, active, completed }, { update, retract }) => ({
  todoFilter: filter,
  activeTodoCount: active,
  completedCount: done,
  clearCompleted: () => retract(...completed),
  changeFilter: (f: string) => update(["global", "ui/filter", f]),
}))(TodoFooterPure);
