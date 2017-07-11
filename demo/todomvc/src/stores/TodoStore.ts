import { TodoModel } from "../models/TodoModel";
import * as Utils from "../utils";

export class TodoStore {
  todos: TodoModel[] = [];

  get activeTodoCount() {
    return this.todos.reduce(
      (sum, todo) => sum + (todo.completed ? 0 : 1),
      0,
    );
  }

  get completedCount() {
    return this.todos.length - this.activeTodoCount;
  }

  addTodo(title: string) {
    this.todos.push(new TodoModel(Utils.uuid(), title, false));
  }

  toggleAll(checked: boolean) {
    this.todos.forEach(
      todo => todo.completed = checked,
    );
  }

  clearCompleted() {
    this.todos = this.todos.filter(
      todo => !todo.completed,
    );
  }
}
