import {
  defineVariables,
  IParsedCondition,
  IVariableBindings,
} from "./Condition";
import { IFactTuple } from "./Fact";
import { IProductionNode } from "./nodes/ProductionNode";
import { IToken } from "./Token";

export interface IProduction {
  conditions: IParsedCondition[];
  productionNode: IProductionNode;

  onActivation: (
    f: IFactTuple,
    t: IToken,
  ) => void | null | undefined | IFactTuple | IFactTuple[];
}

export function makeProduction(
  conditions: IParsedCondition[],
  onActivation: (f: IFactTuple, variableBindings: IVariableBindings) => any,
): IProduction {
  const node: IProduction = Object.create(null);

  node.conditions = conditions;

  node.onActivation = (
    f: IFactTuple,
    t: IToken,
  ): void | null | undefined | IFactTuple | IFactTuple[] => {
    return onActivation(f, defineVariables(conditions, t));
  };

  return node;
}
