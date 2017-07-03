import { ICondition } from "./Condition";
import { IFactTuple } from "./Fact";
import { IProductionNode } from "./nodes/ProductionNode";
import { IToken } from "./Token";

export interface IProduction {
  conditions: ICondition[];
  productionNode: IProductionNode;

  onActivation: (f: IFactTuple, t: IToken) => any;
}

export function makeProduction(
  onActivation: (f: IFactTuple, t: IToken) => any,
): IProduction {
  const node: IProduction = Object.create(null);

  node.onActivation = onActivation;

  return node;
}
