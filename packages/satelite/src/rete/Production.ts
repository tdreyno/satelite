import { ICondition } from "./Condition";
import { IProductionNode } from "./nodes/ProductionNode";

export interface IProduction {
  conditions: ICondition[];
  productionNode: IProductionNode;

  onActivation: () => any;
}

export function makeProduction(onActivation: () => any): IProduction {
  const node: IProduction = Object.create(null);

  node.onActivation = onActivation;

  return node;
}
