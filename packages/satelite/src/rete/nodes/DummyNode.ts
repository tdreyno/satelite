import { addToListHead } from "../util";
import { IBetaMemoryNode } from "./BetaMemoryNode";
import { IReteNode } from "./ReteNode";

export interface IDummyNode extends IBetaMemoryNode {
  type: "dummy";
}

export function makeDummyNode(parent: IReteNode): IDummyNode {
  const node: IDummyNode = Object.create(null);

  node.type = "dummy";
  node.items = null;
  node.parent = parent;
  node.children = null;

  parent.children = addToListHead(parent.children, node);

  return node;
}
