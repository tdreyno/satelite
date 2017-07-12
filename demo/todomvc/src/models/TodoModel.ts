import {
  count,
  IFact,
  IIdentifier,
  makeIdentifier,
  Rete,
} from "../../../../src";

export type ITodoIdentifier = IIdentifier<string>;
export const Todo = (id: string): ITodoIdentifier => makeIdentifier("todo", id);

export interface ITodoModel {
  id: ITodoIdentifier;
  title: string;
  completed: boolean;
}
