import map = require("lodash/map");
import { compose, withHandlers } from "recompose";
import {
  collect,
  IFact,
  placeholder as _,
  retract,
  subscribe,
  update,
} from "../../data";
import { TodoOverview as TodoOverviewPure } from "./TodoOverview";

export const TodoOverview = compose(
  subscribe(
    ["global", "ui/filter", "?todoFilter"],
    ["global", "activeCount", "?activeTodoCount"],
    collect("?allIds", "?e", ["?e", "todo/text", _]),
    collect("?todoIds", "?e", ["?e", "todo/visible", true]),
  ),
  withHandlers({
    toggleAll: ({ allIds }: { allIds: string[] }) => (checked: boolean) => {
      const action = checked ? update : retract;
      const facts = map(allIds, id => [id, "todo/completed", true] as IFact);
      action(...facts);
    },
  }),
)(TodoOverviewPure);
