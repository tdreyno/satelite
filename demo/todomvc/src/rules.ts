import { count, not, placeholder as _, Rete } from "../../../src";
import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS } from "./constants";

export default function initializeRules({ rule }: Rete) {
  // Count the done items
  rule(count("?n", [_, "todo/completed", true])).then(({ n }) => [
    "global",
    "doneCount",
    n,
  ]);

  // Count the active items
  rule(
    ["global", "doneCount", "?done"],
    count("?total", [_, "todo/text", _]),
  ).then(({ total, done }) => ["global", "activeCount", total - done]);

  // Mark as visible when filter is all
  rule(
    ["global", "ui/filter", ALL_TODOS],
    ["?id", "todo/text", _],
  ).then(({ id }) => [id, "todo/visible", true]);

  // Mark as visible when they are active and filter is active
  rule(
    ["global", "ui/filter", ACTIVE_TODOS],
    ["?id", "todo/text", _],
    not(["?id", "todo/completed", true]),
  ).then(({ id }) => [id, "todo/visible", true]);

  // Mark as visible when they are completed and filter is complete
  rule(
    ["global", "ui/filter", COMPLETED_TODOS],
    ["?id", "todo/completed", true],
  ).then(({ id }) => [id, "todo/visible", true]);
}
