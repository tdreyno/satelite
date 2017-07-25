import * as React from "react";
import { withHandlers } from "recompose";
import {
  assert,
  entity,
  retract,
  retractEntity,
  subscribe,
  update,
} from "../data";

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export interface ITodo {
  attributes: {
    "todo/text": string;
    "todo/completed"?: boolean;
    "todo/isBeingEdited"?: boolean;
  };
}

export interface ITodoItemProps {
  todoId: string;
  todo: ITodo | null;
  setIsBeingEdited: (isBeingEdited: boolean) => any;
  setTitle: (title: string) => any;
  toggleTodo: () => any;
  destroyTodo: () => any;
}
export interface ITodoItemState {
  editText: string;
}

class TodoItemPure extends React.Component<ITodoItemProps, ITodoItemState> {
  state = {
    editText: "",
  };

  render() {
    if (!this.props.todo) {
      return null;
    }

    const t = this.props.todo.attributes;

    return (
      <li
        className={[
          t["todo/completed"] ? "completed" : "",
          t["todo/isBeingEdited"] ? "editing" : "",
        ].join(" ")}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={t["todo/completed"]}
            onChange={this.handleToggle.bind(this)}
          />
          <label onDoubleClick={this.handleEdit.bind(this)}>
            {t["todo/text"]}
          </label>
          <button className="destroy" onClick={this.handleDestroy.bind(this)} />
        </div>
        <input
          className="edit"
          value={this.state.editText}
          onBlur={this.handleSubmit.bind(this)}
          onChange={this.handleChange.bind(this)}
          onKeyDown={this.handleKeyDown.bind(this)}
        />
      </li>
    );
  }

  handleSubmit() {
    const val = this.state.editText.trim();
    if (val) {
      this.props.setTitle(val);
      this.setState({ editText: val });
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
    this.state.editText = this.props.todo!.attributes["todo/text"];
  }

  handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.which === ESCAPE_KEY) {
      this.state.editText = this.props.todo!.attributes["todo/text"];
      this.props.setIsBeingEdited(false);
    } else if (event.which === ENTER_KEY) {
      this.handleSubmit();
    }
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ editText: event.target.value });
  }

  handleToggle() {
    this.props.toggleTodo();
  }
}

export type ITodoItemOwnProps = Pick<ITodoItemProps, "todoId">;
export type ITodoItemReteProps = Pick<ITodoItemProps, "todo">;
export type ITodoItemHandlerProps = Pick<
  ITodoItemProps,
  "setIsBeingEdited" | "destroyTodo" | "setTitle" | "toggleTodo"
>;

const TodoItemWithHandlers = withHandlers<
  ITodoItemHandlerProps,
  ITodoItemOwnProps & ITodoItemReteProps
>({
  setIsBeingEdited: ({ todoId }) => (v: boolean) =>
    v
      ? assert([todoId, "todo/isBeingEdited", true])
      : retract([todoId, "todo/isBeingEdited", true]),
  destroyTodo: ({ todoId }) => () => retractEntity(todoId),
  setTitle: ({ todoId }) => (t: string) => update([todoId, "todo/text", t]),
  toggleTodo: ({ todo, todoId }) => () =>
    todo && todo.attributes["todo/completed"]
      ? retract([todoId, "todo/completed", true])
      : assert([todoId, "todo/completed", true]),
})(TodoItemPure);

export const TodoItem = subscribe<
  ITodoItemOwnProps,
  ITodoItemOwnProps
>(({ todoId }) => entity("?todo", todoId))(TodoItemWithHandlers);
