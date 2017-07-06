import { ICondition } from "./Condition";
import { IFact, IFactTuple, makeFactTuple } from "./Fact";
import { IQueryNode } from "./nodes/QueryNode";

export type IQueryChangeFn = (facts: IFactTuple[]) => any;

export interface IQuery {
  conditions: ICondition[];
  queryNode: IQueryNode | null;

  getFacts: () => IFactTuple[];
  callbacks: Set<IQueryChangeFn>;
  didChange: () => void;
  onChange: (cb: IQueryChangeFn) => void;
  offChange: (cb: IQueryChangeFn) => void;
}

export function makeQuery(): IQuery {
  const node: IQuery = Object.create(null);

  node.callbacks = new Set();
  node.queryNode = null;
  node.getFacts = (): IFactTuple[] => {
    return node.queryNode && node.queryNode.facts
      ? (node.queryNode.facts as IFact[]).map(f => makeFactTuple(f))
      : [];
  };

  node.didChange = (): void => {
    const factTuples = node.getFacts();

    for (const callback of node.callbacks) {
      callback(factTuples);
    }
  };

  node.onChange = (cb: (facts: IFactTuple[]) => any): void => {
    node.callbacks.add(cb);
  };

  node.offChange = (cb: (facts: IFactTuple[]) => any): void => {
    node.callbacks.delete(cb);
  };

  return node;
}
