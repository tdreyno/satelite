import * as React from "react";
import * as ReactDOM from "react-dom";

const ENTER_KEY = 13;

export interface ITodoEntryProps {
  addTodo: (text: string) => any;
}

export class TodoEntry extends React.Component<ITodoEntryProps> {
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
