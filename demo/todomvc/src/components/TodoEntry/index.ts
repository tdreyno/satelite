import { compose, withHandlers } from "recompose";
import { assert } from "../../data";
import { makeUUId } from "../../utils";
import { TodoEntry as TodoEntryPure } from "./TodoEntry";

export const TodoEntry = compose(
  withHandlers({
    addTodo: () => (text: string) => assert([makeUUId(), "todo/text", text]),
  }),
)(TodoEntryPure);
