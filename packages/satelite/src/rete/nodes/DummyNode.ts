import { IBetaMemoryNode } from "./BetaMemoryNode";

export interface IDummyNode extends IBetaMemoryNode {
  type: "dummy";
  items: null;
  parent: null;
}

export function makeDummyNode(): IDummyNode {
  const node: IDummyNode = Object.create(null);

  node.type = "dummy";
  node.items = null;
  node.parent = null;

  return node;
}
