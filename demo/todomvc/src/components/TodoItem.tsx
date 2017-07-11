import * as React from "react";
import { TodoModel } from "../models/TodoModel";
import { ViewStore } from "../stores/ViewStore";

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export class TodoItem extends React.Component<{
  todo: TodoModel;
  viewStore: ViewStore;
}> {
  editText: string = "";

  render() {
    const { viewStore, todo } = this.props;
    return (
      <li
        className={[
          todo.completed ? "completed" : "",
          todo === viewStore.todoBeingEdited ? "editing" : "",
        ].join(" ")}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={todo.completed}
            onChange={this.handleToggle.bind(this)}
          />
          <label onDoubleClick={this.handleEdit}>
            {todo.title}
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
      this.props.todo.setTitle(val);
      this.editText = val;
    } else {
      this.handleDestroy();
    }
    this.props.viewStore.todoBeingEdited = null;
  }

  handleDestroy() {
    this.props.todo.destroy();
    this.props.viewStore.todoBeingEdited = null;
  }

  handleEdit() {
    const todo = this.props.todo;
    this.props.viewStore.todoBeingEdited = todo;
    this.editText = todo.title;
  }

  handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.which === ESCAPE_KEY) {
      this.editText = this.props.todo.title;
      this.props.viewStore.todoBeingEdited = null;
    } else if (event.which === ENTER_KEY) {
      this.handleSubmit();
    }
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.editText = event.target.value;
  }

  handleToggle() {
    this.props.todo.toggle();
  }
}
