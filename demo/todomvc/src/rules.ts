import { count, not, Rete } from "../../../src";
import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS } from "./constants";

export const doneCount = ({ rule, _, update }: Rete) =>
  rule(count("?n", [_, "todo/completed", true])).then(({ n }) =>
    update(["global", "doneCount", n]),
  );

export const activeCount = ({ rule, _, update }: Rete) =>
  rule(
    ["global", "doneCount", "?done"],
    count("?total", [_, "todo/text", _]),
  ).then(({ total, done }) => update(["global", "activeCount", total - done]));

export const todoVisibilityAll = ({ rule, _ }: Rete) =>
  rule(
    ["global", "ui/filter", ALL_TODOS],
    ["?id", "todo/text", _],
  ).then(({ id }: { id: string }, { addProducedFact }) => {
    addProducedFact([id, "todo/visible", true]);
  });

export const todoVisibilityActive = ({ rule, _ }: Rete) =>
  rule(
    ["global", "ui/filter", ACTIVE_TODOS],
    ["?id", "todo/text", _],
    not(["?id", "todo/completed", true]),
  ).then(({ id }: { id: string }, { addProducedFact }) => {
    addProducedFact([id, "todo/visible", true]);
  });

export const todoVisibilityComplete = ({ rule, _ }: Rete) =>
  rule(
    ["global", "ui/filter", COMPLETED_TODOS],
    ["?id", "todo/completed", true],
  ).then(({ id }: { id: string }, { addProducedFact }) => {
    addProducedFact([id, "todo/visible", true]);
  });
