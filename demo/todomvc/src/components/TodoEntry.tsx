import * as React from "react";
import * as ReactDOM from "react-dom";
import { inject } from "../../../../src/react";
import { Todo } from "../models/TodoModel";
import { TodoStore } from "../stores/TodoStore";
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

export const TodoEntry = inject(({ addFact }) => ({
  addTodo: (text: string) => {
    const id = Todo(uuid());
    addFact([id, "todo/text", text]);
    addFact([id, "todo/completed", false]);
  },
}))(TodoEntryPure);
