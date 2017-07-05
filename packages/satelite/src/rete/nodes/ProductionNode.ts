import { makeFactTuple } from "../Fact";
import { IProduction } from "../Production";
import { compareTokens, IToken } from "../Token";
import { addToListHead, IList, uniqueInList } from "../util";
import { IReteNode } from "./ReteNode";

export interface IProductionNode extends IReteNode {
  type: "production";
  items: IList<IToken>;
  production: IProduction;
}

export function makeProductionNode(production: IProduction): IProductionNode {
  const node: IProductionNode = Object.create(null);

  node.type = "production";
  node.items = null;
  node.production = production;

  return node;
}

export function productionNodeLeftActivation(
  node: IProductionNode,
  t: IToken,
): void {
  if (!uniqueInList(node.items, t, compareTokens)) {
    return;
  }

  node.items = addToListHead(node.items, t);

  // debugger;
  node.production.onActivation(makeFactTuple(t.fact), t);
}
