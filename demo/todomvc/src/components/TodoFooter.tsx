import * as React from "react";
import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS } from "../constants";
import { TodoStore } from "../stores/TodoStore";
import { ViewStore } from "../stores/ViewStore";
import { pluralize } from "../utils";

export class TodoFooter extends React.Component<{
  viewStore: ViewStore;
  todoStore: TodoStore;
}> {
  render() {
    const todoStore = this.props.todoStore;
    if (!todoStore.activeTodoCount && !todoStore.completedCount) {
      return null;
    }

    const activeTodoWord = pluralize(todoStore.activeTodoCount, "item");

    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{todoStore.activeTodoCount}</strong> {activeTodoWord} left
        </span>
        <ul className="filters">
          {this.renderFilterLink(ALL_TODOS, "", "All")}
          {this.renderFilterLink(ACTIVE_TODOS, "active", "Active")}
          {this.renderFilterLink(COMPLETED_TODOS, "completed", "Completed")}
        </ul>
        {todoStore.completedCount === 0
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

  renderFilterLink(filterName: string, url: string, caption: string) {
    return (
      <li>
        <a
          href={"#/" + url}
          className={
            filterName === this.props.viewStore.todoFilter ? "selected" : ""
          }
        >
          {caption}
        </a>{" "}
      </li>
    );
  }

  clearCompleted() {
    this.props.todoStore.clearCompleted();
  }
}
