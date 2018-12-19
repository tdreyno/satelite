import { compose, withHandlers } from "recompose";
import {
  assert,
  entity,
  retract,
  retractEntity,
  subscribe,
  update
} from "../../data";
import { ITodoItemProps, TodoItem as TodoItemPure } from "./TodoItem";

export type ITodoItemOwnProps = Pick<ITodoItemProps, "todoId">;
export type ITodoItemReteProps = Pick<ITodoItemProps, "todo">;
export type ITodoItemHandlerProps = Pick<
  ITodoItemProps,
  "setIsBeingEdited" | "destroyTodo" | "setTitle" | "toggleTodo"
>;

export const TodoItem = compose<ITodoItemOwnProps, ITodoItemOwnProps>(
  subscribe<any, ITodoItemProps>(({ todoId }) =>
    entity("?todo", todoId, { stripPrefix: true })
  ),
  withHandlers<ITodoItemHandlerProps, ITodoItemOwnProps & ITodoItemReteProps>({
    setIsBeingEdited: ({ todoId }) => (v: boolean) => {
      const action = v ? assert : retract;
      action([todoId, "todo/isBeingEdited", true]);
    },

    destroyTodo: ({ todoId }) => () => retractEntity(todoId),

    setTitle: ({ todoId }) => (title: string) =>
      update([todoId, "todo/text", title]),

    toggleTodo: ({ todo, todoId }) => () => {
      const action = todo && todo.completed ? retract : assert;
      action([todoId, "todo/completed", true]);
    }
  })
)(TodoItemPure);
