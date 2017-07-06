import { IFact } from "../Fact";
import { makeToken } from "../Token";
import {
  addToListHead,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
} from "../util";
import { IAlphaMemoryNode } from "./AlphaMemoryNode";
import { IReteNode } from "./ReteNode";

export interface IRootJoinNode extends IReteNode {
  type: "root-join";
  alphaMemory: IAlphaMemoryNode;
}

export function makeRootJoinNode(
  parent: IReteNode,
  alphaMemory: IAlphaMemoryNode,
): IRootJoinNode {
  const node: IRootJoinNode = Object.create(null);

  node.type = "root-join";
  node.parent = parent;
  node.children = null;
  node.alphaMemory = alphaMemory;

  parent.children = addToListHead(parent.children, node);
  alphaMemory.successors = addToListHead(alphaMemory.successors, node);

  return node;
}

export function rootJoinNodeRightActivate(node: IRootJoinNode, f: IFact): void {
  const t = makeToken(node, null, f);
  runLeftActivateOnNodes(node.children, t);
}

export function rootJoinNodeRightRetract(node: IRootJoinNode, f: IFact): void {
  const t = makeToken(node, null, f);
  runLeftRetractOnNodes(node.children, t);
}
