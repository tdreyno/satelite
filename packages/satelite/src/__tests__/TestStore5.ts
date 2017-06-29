import { generate as uuid } from "uuid";

import { defineState, placeholder as _, schema, t } from "../Store5";

const { assert, retract, find } = defineState(
  schema("todo/visible", { type: t.Boolean }),
  schema("todo/completed", { type: t.Boolean }),
  schema("todo/text", { type: t.String }),
  schema("app/filter", { type: t.String }),
  schema("app/todos", { type: t.String, isMultiple: true }),
);

export type IFilterState = "show_all" | "show_completed" | "show_active";

const filter = ["global", "app/filter"];
const todosList = ["global", "app/todos"];

export function visibleTodos() {
  return find([_, "todo/visible", true]);
}

export function completedCount() {
  return find([_, "todo/completed", true]).length;
}

export function findTodo(id: string) {
  return find([id, _, _])[0];
}

export function addTodo(text: string) {
  const guid = uuid();

  assert([guid, "todo/text", text]);
  assert([...todosList, guid]);
}

export function deleteTodo(id: string) {
  retract([...todosList, id]);
}

export function editTodo(id: string, text: string) {
  assert([id, "todo/text", text]);
}

export function completeTodo(id: string) {
  assert([id, "todo/completed", true]);
}

export function completeAll() {
  const all = find([...todosList, _]);
  const updated = all.map(d => [d[2], "todo/completed", true]);
  assert(updated);
}

export function clearCompleted() {
  retract(find([_, "todo/completed", true]));
}

export function setFilter(filterName: IFilterState) {
  assert([...filter, filterName]);
}
