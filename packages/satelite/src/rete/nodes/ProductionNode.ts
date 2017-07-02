import { IProduction } from "../Production";
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
