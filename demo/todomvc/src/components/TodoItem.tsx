import * as React from "react";
import { inject } from "../../../../src/react";
import { ITodoIdentifier } from "../models/TodoModel";

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export interface ITodoOverviewProps {
  todo: ITodoIdentifier;
  isCompleted: boolean;
  title: string;
  isBeingEdited: boolean;
  setIsBeingEdited: (isBeingEdited: boolean) => any;
  setTitle: (title: string) => any;
  toggleTodo: () => any;
  destroyTodo: () => any;
}

class TodoItemPure extends React.Component<ITodoOverviewProps> {
  editText: string = "";

  render() {
    const { isBeingEdited, isCompleted, title } = this.props;
    return (
      <li
        className={[
          isCompleted ? "completed" : "",
          isBeingEdited ? "editing" : "",
        ].join(" ")}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={isCompleted}
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
    this.editText = this.props.title;
  }

  handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.which === ESCAPE_KEY) {
      this.editText = this.props.title;
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

export type ITodoOverviewOwnProps = Pick<ITodoOverviewProps, "todo">;
export type ITodoOverviewReteProps = Pick<
  ITodoOverviewProps,
  | "isBeingEdited"
  | "setIsBeingEdited"
  | "destroyTodo"
  | "setTitle"
  | "title"
  | "toggleTodo"
  | "isCompleted"
>;

export const TodoItem = inject<
  ITodoOverviewReteProps,
  ITodoOverviewOwnProps
>(({ addFact, removeFact, queryImmediately, _ }, { todo }) => {
  const isCompleted =
    queryImmediately([[todo, "todo/completed", true]]).length > 0;
  return {
    isCompleted,
    title: queryImmediately([[todo, "todo/title", _]])[0][2],
    isBeingEdited:
      queryImmediately([[todo, "todo/isBeingEdited", true]]).length > 0,
    setIsBeingEdited: (isBeingEdited: boolean) => {
      addFact([todo, "todo/isBeingEdited", isBeingEdited]);
    },
    destroyTodo: () => removeFact([todo, _, _]),
    setTitle: (title: string) => addFact([todo, "todo/title", title]),
    toggleTodo: () =>
      isCompleted
        ? addFact([todo, "todo/completed", true])
        : removeFact([todo, "todo/completed", true]),
  };
})(TodoItemPure);
