import { collect, count, IFact, not, Rete } from "../../../src";
import { ACTIVE_TODOS, COMPLETED_TODOS } from "./constants";

const makeDoneCount = (n: number): IFact => ["global", "doneCount", n];
const makeActiveCount = (n: number): IFact => ["global", "activeCount", n];

export const insertDoneCount = ({ rule, _, assert }: Rete) =>
  rule(count("?n", [_, "todo/completed", true])).then(({ n }) =>
    assert(makeDoneCount(n)),
  );

export const insertActiveCount = ({ rule, _, assert }: Rete) =>
  rule(
    [_, "doneCount", "?done"],
    count("?total", [_, "todo/text", _]),
  ).then(({ total, done }) => assert(makeActiveCount(total - done)));

export const todoVisibility = ({ rule, _, assert }: Rete) =>
  rule(
    ["global", "ui/filter", "?filter"],
    ["?id", "todo/text", _],
    collect("?completed", ["?id", "todo/completed", true]),
    collect("?active", not(["?id", "todo/completed", true])),
  ).then(
    ({
      filter,
      completed,
      active,
    }: {
      filter: string;
      completed: IFact[];
      active: IFact[];
    }) => {
      assert(
        ...completed.map<IFact>(([id]) => {
          switch (filter) {
            case ACTIVE_TODOS:
              return [id, "todo/visible", false];
            case COMPLETED_TODOS:
            default:
              return [id, "todo/visible", true];
          }
        }),
      );

      assert(
        ...active.map<IFact>(([id]) => {
          switch (filter) {
            case COMPLETED_TODOS:
              return [id, "todo/visible", false];
            case ACTIVE_TODOS:
            default:
              return [id, "todo/visible", true];
          }
        }),
      );
    },
  );
