import { count, IIdentifier, makeIdentifier, Rete } from "../../../../src";

export type ITodoIdentifier = IIdentifier<string>;
export const Todo = (id: string): ITodoIdentifier => makeIdentifier("todo", id);

export interface ITodoModel {
  id: ITodoIdentifier;
  title: string;
  completed: boolean;
}

export function todoFilter({ queryImmediately, _ }: Rete): string {
  return queryImmediately([["global", "ui/filter", _]])[2] as any;
}

export function activeTodoCount({ queryImmediately, _ }: Rete): number {
  return queryImmediately([
    count("?count", [[_, "todo/completed", false]]),
  ])[0] as any;
}

export function completedTodoCount({ queryImmediately, _ }: Rete): number {
  return queryImmediately([
    count("?count", [[_, "todo/completed", true]]),
  ])[0] as any;
}
