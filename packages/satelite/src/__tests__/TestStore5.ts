import { generate as uuid } from "uuid";

import { defineState, placeholder as _, schema, t, value } from "../Store5";

const { assert, retract, find, rule } = defineState(
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
  assert([guid, "todo/completed", false]);

  const currentFilter = value(find(["global", "app/filter", _])[0]);
  const isVisible = currentFilter !== "show_completed";
  assert([guid, "todo/visible", isVisible]);

  assert([...todosList, guid]);
}

export function deleteTodo(id: string) {
  retract([...todosList, id]);
  retract(find([id, _, _]));
}

export function editTodo(id: string, text: string) {
  assert([id, "todo/text", text]);
}

export function completeTodo(id: string) {
  assert([id, "todo/completed", true]);
}

export function findAll() {
  return find([...todosList, _]);
}

export function findCompleted() {
  return find([_, "todo/completed", true]);
}

export function findActive() {
  return find([_, "todo/completed", false]);
}

export function completeAll() {
  const all = findAll();
  const updated = all.map(d => [d[2], "todo/completed", true]);
  assert(updated);
}

export function hideAll() {
  const all = findAll();
  const updated = all.map(d => [d[2], "todo/visible", false]);
  assert(updated);
}

export function showAll() {
  const all = findAll();
  const updated = all.map(d => [d[2], "todo/visible", true]);
  assert(updated);
}

export function showCompleted() {
  hideAll();

  const all = findCompleted();
  const updated = all.map(d => [d[2], "todo/visible", true]);
  assert(updated);
}

export function showActive() {
  hideAll();

  const all = findActive();
  const updated = all.map(d => [d[2], "todo/visible", true]);
  assert(updated);
}

export function clearCompleted() {
  retract(find([_, "todo/completed", true]));
}

export function setFilter(filterName: IFilterState) {
  assert([...filter, filterName]);
}

// Bind rules
rule([...filter, "show_all"], showAll);
rule([...filter, "show_completed"], showCompleted);
rule([...filter, "show_active"], showActive);
