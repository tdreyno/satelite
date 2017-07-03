import { IFact, makeFactTuple } from "../Fact";
import { IProduction } from "../Production";
import { IReteNode } from "./ReteNode";
import { IToken } from "../Token";

export interface IProductionNode extends IReteNode {
  type: "production";
  production: IProduction;
  fact: IFact | null;
}

export function makeProductionNode(production: IProduction): IProductionNode {
  const node: IProductionNode = Object.create(null);

  node.type = "production";
  node.production = production;
  node.fact = null;

  return node;
}

export function productionNodeLeftActivation(
  node: IProductionNode,
  t: IToken,
  f: IFact,
): void {
  if (node.fact !== f) {
    node.fact = f;
    node.production.onActivation(makeFactTuple(f), t);
  }
}
