import { ALL_TODOS } from "../constants";
import { TodoModel } from "../models/TodoModel";

export class ViewStore {
  todoBeingEdited: TodoModel | null = null;
  todoFilter = ALL_TODOS;
}
