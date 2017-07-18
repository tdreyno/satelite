import * as React from "react";
import { collect, IFact, IIdentifier, placeholder as _ } from "../../../../src";
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

export const TodoOverview = subscribe(
  ["global", "ui/filter", "?todoFilter"],
  ["global", "activeCount", "?activeTodoCount"],
  collect("?allIds", "?e", ["?e", "todo/text", _]),
  collect("?visibleIds", "?e", ["?e", "todo/visible", true]),
).then(
  (
    {
      todoFilter,
      activeTodoCount,
      visibleIds,
      allIds,
    }: {
      todoFilter: string;
      activeTodoCount: number;
      visibleIds: IIdentifier[];
      allIds: IIdentifier[];
    },
    { update, retract },
  ) => {
    return {
      todoFilter,
      activeTodoCount,
      todoIds: visibleIds,

      // Actions
      toggleAll: (checked: boolean) => {
        const facts = allIds.map(id => [id, "todo/completed", true] as IFact);

        if (checked) {
          update(...facts);
        } else {
          retract(...facts);
        }
      },
    };
  },
)(TodoOverviewPure);
