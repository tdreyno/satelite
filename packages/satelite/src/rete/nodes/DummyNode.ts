import { IFact } from "../Fact";
import { makeToken } from "../Token";
import { addToListHead, forEachList, runLeftActivationOnNode } from "../util";
import { IBetaMemoryNode } from "./BetaMemoryNode";

export interface IDummyNode extends IBetaMemoryNode {
  type: "dummy";
  parent: null;
}

export function makeDummyNode(): IDummyNode {
  const node: IDummyNode = Object.create(null);

  node.type = "dummy";
  node.items = null;
  node.parent = null;
  node.children = null;

  return node;
}

export function dummyNodeRightActivation(node: IDummyNode, f: IFact): void {
  const t = makeToken(node, null, f);

  node.items = addToListHead(node.items, t);

  forEachList(child => {
    runLeftActivationOnNode(child, t, f);
  }, node.children);
}
