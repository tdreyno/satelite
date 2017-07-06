import {
  defineVariables,
  IParsedCondition,
  IVariableBindings,
} from "./Condition";
import { IFactTuple } from "./Fact";
import { IProductionNode } from "./nodes/ProductionNode";
import { IToken } from "./Token";

export type IAddFactsSignature = (facts: IFactTuple | IFactTuple[]) => void;
export type IActivateCallback = (
  variableBindings: IVariableBindings,
  extra: {
    fact: IFactTuple;
    addProducedFact: IAddFactsSignature;
  },
) => any;

export type IInternalActivateCallback = (
  f: IFactTuple,
  t: IToken,
  addProducedFact: IAddFactsSignature,
  addFact: IAddFactsSignature,
) => any;

export interface IProduction {
  conditions: IParsedCondition[];
  productionNode: IProductionNode;
  onActivation: IInternalActivateCallback;
}

export function makeProduction(
  conditions: IParsedCondition[],
  onActivation: IActivateCallback,
): IProduction {
  const node: IProduction = Object.create(null);

  node.conditions = conditions;

  node.onActivation = (
    f: IFactTuple,
    t: IToken,
    addProducedFact: (facts: IFactTuple | IFactTuple[]) => void,
  ): void => {
    onActivation(defineVariables(conditions, t), {
      fact: f,
      addProducedFact,
    });
  };

  return node;
}
