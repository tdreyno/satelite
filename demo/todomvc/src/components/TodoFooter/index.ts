import { compose, withHandlers } from "recompose";
import {
  collect,
  placeholder as _,
  retract,
  subscribe,
  update,
} from "../../data";
import { TodoFooter as TodoFooterPure } from "./TodoFooter";

export const TodoFooter = compose(
  subscribe(
    ["global", "ui/filter", "?todoFilter"],
    ["global", "doneCount", "?completedCount"],
    ["global", "activeCount", "?activeTodoCount"],
    collect("?completed", [_, "todo/completed", true]),
  ),
  withHandlers({
    clearCompleted: ({ completed }) => () => retract(...completed),
    changeFilter: () => (f: string) => update(["global", "ui/filter", f]),
  }),
)(TodoFooterPure);
