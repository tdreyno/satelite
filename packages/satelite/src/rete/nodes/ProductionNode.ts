import { IFact, makeFactTuple } from "../Fact";
import { IProduction } from "../Production";
import { IToken } from "../Token";
import { IReteNode } from "./ReteNode";

export interface IProductionNode extends IReteNode {
  type: "production";
  production: IProduction;
}

export function makeProductionNode(production: IProduction): IProductionNode {
  const node: IProductionNode = Object.create(null);

  node.type = "production";
  node.production = production;

  return node;
}

export function productionNodeLeftActivation(
  node: IProductionNode,
  t: IToken,
  f: IFact,
): void {
  node.production.onActivation(makeFactTuple(f), t);
}
