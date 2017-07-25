import * as React from "react";
import { TodoEntry } from "../TodoEntry";
import { TodoFooter } from "../TodoFooter";
import { TodoOverview } from "../TodoOverview";

export class TodoApp extends React.Component {
  render() {
    return (
      <div>
        <header className="header">
          <h1>todos</h1>

          <TodoEntry />
        </header>

        <TodoOverview />

        <TodoFooter />
      </div>
    );
  }
}
