import * as React from "react";
import { withHandlers } from "recompose";
import {
  collect,
  IFact,
  placeholder as _,
  retract,
  subscribe,
  update,
} from "../data";
import { TodoItem } from "./TodoItem";

export interface ITodoOverviewProps {
  todoFilter: string;
  activeTodoCount: number;
  todoIds: string[];
  allIds: string[];
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
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
          onChange={this.toggleAll.bind(this)}
          checked={activeTodoCount === 0}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
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

export type ITodoOverviewReteProps = Pick<
  ITodoOverviewProps,
  "todoFilter" | "activeTodoCount" | "todoIds" | "allIds"
>;

export type ITodoOverviewHandlerProps = Pick<ITodoOverviewProps, "toggleAll">;

const TodoOverviewWithHandlers = withHandlers<
  ITodoOverviewHandlerProps,
  ITodoOverviewReteProps
>({
  toggleAll: ({ allIds }: { allIds: string[] }) => (checked: boolean) => {
    const facts = allIds.map(id => [id, "todo/completed", true] as IFact);

    if (checked) {
      update(...facts);
    } else {
      retract(...facts);
    }
  },
})(TodoOverviewPure);

export const TodoOverview = subscribe(
  ["global", "ui/filter", "?todoFilter"],
  ["global", "activeCount", "?activeTodoCount"],
  collect("?allIds", "?e", ["?e", "todo/text", _]),
  collect("?todoIds", "?e", ["?e", "todo/visible", true]),
)(TodoOverviewWithHandlers);
