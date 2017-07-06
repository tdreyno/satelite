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
    addProducedFacts: (facts: IFactTuple | IFactTuple[]) => void,
    addFact: (facts: IFactTuple | IFactTuple[]) => void,
  ) => void;
}

export function makeProduction(
  conditions: IParsedCondition[],
  onActivation: (
    f: IFactTuple,
    variableBindings: IVariableBindings,
    addProducedFacts: (facts: IFactTuple | IFactTuple[]) => void,
    addFact: (facts: IFactTuple | IFactTuple[]) => void,
  ) => any,
): IProduction {
  const node: IProduction = Object.create(null);

  node.conditions = conditions;

  node.onActivation = (
    f: IFactTuple,
    t: IToken,
    addProducedFacts: (facts: IFactTuple | IFactTuple[]) => void,
    addFact: (facts: IFactTuple | IFactTuple[]) => void,
  ): void => {
    onActivation(f, defineVariables(conditions, t), addProducedFacts, addFact);
  };

  return node;
}
