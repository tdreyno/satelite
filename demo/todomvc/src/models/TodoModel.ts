import { count, IIdentifier, makeIdentifier, Rete } from "../../../../src";

export type ITodoIdentifier = IIdentifier<string>;
export const Todo = (id: string): ITodoIdentifier => makeIdentifier("todo", id);

export interface ITodoModel {
  id: ITodoIdentifier;
  title: string;
  completed: boolean;
}

export function todoFilter({ findOne }: Rete): string {
  return findOne(["global", "ui/filter", "?filter"]).filter;
}

export function activeTodoCount({ findOne, _ }: Rete): number {
  return findOne(count("?count", ["?e", "todo/completed", false])).count;
}

export function completedTodoCount({ findOne, _ }: Rete): number {
  return findOne(count("?count", ["?e", "todo/completed", false])).count;
}
