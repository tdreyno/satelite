import * as React from "react";
import * as ReactDOM from "react-dom";
import { subscribe } from "../../../../src/react";
import { uuid } from "../utils";

const ENTER_KEY = 13;

class TodoEntryPure extends React.Component<{
  addTodo: (text: string) => any;
}> {
  render() {
    return (
      <input
        ref="newField"
        className="new-todo"
        placeholder="What needs to be done?"
        onKeyDown={this.handleNewTodoKeyDown.bind(this)}
        autoFocus={true}
      />
    );
  }

  handleNewTodoKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }

    event.preventDefault();

    const val = (ReactDOM.findDOMNode(
      this.refs.newField,
    ) as HTMLInputElement).value.trim();

    if (val) {
      this.props.addTodo(val);
      (ReactDOM.findDOMNode(this.refs.newField) as HTMLInputElement).value = "";
    }
  }
}

export const TodoEntry = subscribe().then((_, { assert }) => ({
  addTodo: (text: string) => assert([uuid(), "todo/text", text]),
}))(TodoEntryPure);
