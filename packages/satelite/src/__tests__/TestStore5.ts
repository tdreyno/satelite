import {
  defineState,
  descriptor,
  placeholder as _,
  schema,
  scope,
  t
} from "../Store5";

const { assert, retract, find } = defineState(
  schema("todo/visible", { type: t.Boolean }),
  schema("todo/completed", { type: t.Boolean }),
  schema("todo/text", { type: t.String }),
  schema("app/filter", { type: t.String }),
  schema("app/todos", { type: t.String, isMultiple: true })
);

type IFilterState = "show_all" | "show_completed" | "show_active";

const appIdent = Symbol();
const filter = scope<IFilterState>(appIdent, "app/filter");
const todos = scope<symbol>(appIdent, "app/todos");

export function visibleTodos() {
  return find([_, "todo/visible", true]);
}

export function completedCount() {
  return find([_, "todo/completed", true]).length;
}

export function findTodo(id: symbol) {
  return find([id, _, _])[0];
}

export function addTodo(text: string) {
  const id = Symbol();

  assert([id, "todo/text", text]);
  assert(todos(id));
}

export function deleteTodo(id: symbol) {
  retract(todos(id));
}

export function editTodo(id: symbol, text: string) {
  assert([id, "todo/text", text]);
}

export function completeTodo(id: symbol) {
  assert([id, "todo/completed", true]);
}

export function completeAll() {
  const all = find(todos(_));
  const updated = all.map(d => descriptor(d[2], "todo/completed", true));
  assert(updated);
}

export function clearCompleted() {
  retract(find([_, "todo/completed", true]));
}

export function setFilter(filterName: IFilterState) {
  assert(filter(filterName));
}
