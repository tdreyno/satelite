import { extractBindingsFromCondition, IParsedCondition } from "./Condition";
import { IFact, IFactTuple, makeFactTuple } from "./Fact";
import { IQueryNode } from "./nodes/QueryNode";
import { IToken, IVariableBindings } from "./Token";

export type IQueryChangeFn = (
  facts: IFactTuple[],
  variableBindings: IVariableBindings[],
) => any;

export interface IQuery {
  conditions: IParsedCondition[];
  queryNode: IQueryNode | null;

  getFacts: () => IFactTuple[];
  getVariableBindings: () => IVariableBindings[];
  callbacks: Set<IQueryChangeFn>;
  didChange: () => void;
  onChange: (cb: IQueryChangeFn) => void;
  offChange: (cb: IQueryChangeFn) => void;
}

export function makeQuery(conditions: IParsedCondition[]): IQuery {
  const node: IQuery = Object.create(null);

  node.conditions = conditions;
  node.callbacks = new Set();
  node.queryNode = null;

  const lastCondition = node.conditions[node.conditions.length - 1];

  node.getFacts = (): IFactTuple[] => {
    return node.queryNode && node.queryNode.facts
      ? (node.queryNode.facts as IFact[]).map(f => makeFactTuple(f))
      : [];
  };
  node.getVariableBindings = (): IVariableBindings[] => {
    return node.queryNode && node.queryNode.items
      ? (node.queryNode.items as IToken[]).map(t => {
          let bindings = t.bindings;
          if (lastCondition) {
            bindings = extractBindingsFromCondition(
              lastCondition,
              t.fact,
              bindings,
            );
          }
          return bindings;
        })
      : [];
  };

  node.didChange = (): void => {
    const factTuples = node.getFacts();
    const variableBindings = node.getVariableBindings();

    for (const callback of node.callbacks) {
      callback(factTuples, variableBindings);
    }
  };

  node.onChange = (
    cb: (facts: IFactTuple[], variableBindings: IVariableBindings[]) => any,
  ): void => {
    node.callbacks.add(cb);
  };

  node.offChange = (
    cb: (facts: IFactTuple[], variableBindings: IVariableBindings[]) => any,
  ): void => {
    node.callbacks.delete(cb);
  };

  return node;
}
