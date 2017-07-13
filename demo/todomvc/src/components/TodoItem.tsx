import * as React from "react";
import { entity, IEntity } from "../../../../src";
import { subscribe } from "../../../../src/react";

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export interface ITodo {
  title: string;
  completed?: boolean;
  isBeingEdited?: boolean;
}

export interface ITodoOverviewProps {
  todoId: string;
  todo: ITodo;
  setIsBeingEdited: (isBeingEdited: boolean) => any;
  setTitle: (title: string) => any;
  toggleTodo: () => any;
  destroyTodo: () => any;
}

class TodoItemPure extends React.Component<ITodoOverviewProps> {
  editText: string = "";

  render() {
    const { isBeingEdited, completed, title } = this.props.todo;

    return (
      <li
        className={[
          completed ? "completed" : "",
          isBeingEdited ? "editing" : "",
        ].join(" ")}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={completed}
            onChange={this.handleToggle.bind(this)}
          />
          <label onDoubleClick={this.handleEdit}>
            {title}
          </label>
          <button className="destroy" onClick={this.handleDestroy.bind(this)} />
        </div>
        <input
          ref="editField"
          className="edit"
          value={this.editText}
          onBlur={this.handleSubmit.bind(this)}
          onChange={this.handleChange.bind(this)}
          onKeyDown={this.handleKeyDown.bind(this)}
        />
      </li>
    );
  }

  handleSubmit() {
    const val = this.editText.trim();
    if (val) {
      this.props.setTitle(val);
      this.editText = val;
    } else {
      this.handleDestroy();
    }
    this.props.setIsBeingEdited(false);
  }

  handleDestroy() {
    this.props.destroyTodo();
    this.props.setIsBeingEdited(false);
  }

  handleEdit() {
    this.props.setIsBeingEdited(true);
    this.editText = this.props.todo.title;
  }

  handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.which === ESCAPE_KEY) {
      this.editText = this.props.todo.title;
      this.props.setIsBeingEdited(false);
    } else if (event.which === ENTER_KEY) {
      this.handleSubmit();
    }
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.editText = event.target.value;
  }

  handleToggle() {
    this.props.toggleTodo();
  }
}

export type ITodoOverviewOwnProps = Pick<ITodoOverviewProps, "todoId">;
export type ITodoOverviewReteProps = Pick<
  ITodoOverviewProps,
  "todo" | "setIsBeingEdited" | "destroyTodo" | "setTitle" | "toggleTodo"
>;

export const TodoItem = subscribe<
  ITodoOverviewReteProps,
  ITodoOverviewOwnProps
>(({ todoId }) =>
  entity("?todo", todoId),
).then(
  (
    { todo }: { todo: IEntity },
    { assert, retract, retractEntity },
    { todoId }: ITodoOverviewOwnProps,
  ) => ({
    todo: todo.attributes as ITodo,

    setIsBeingEdited: (v: boolean) => assert([todoId, "todo/isBeingEdited", v]),
    destroyTodo: () => retractEntity(todoId),
    setTitle: (t: string) => assert([todoId, "todo/title", t]),
    toggleTodo: () =>
      todo.attributes.completed
        ? assert([todoId, "todo/completed", true])
        : retract([todoId, "todo/completed", true]),
  }),
)(TodoItemPure);
