import { IFact } from "../Fact";
import { compareTokens, IToken, makeToken } from "../Token";
import {
  addToListHead,
  findList,
  forEachList,
  IList,
  runLeftActivationOnNode,
  updateNewNodeWithMatchesFromAbove,
} from "../util";
import { IJoinNode } from "./JoinNode";
import { IReteNode } from "./ReteNode";

export interface IBetaMemoryNode extends IReteNode {
  type: "beta-memory" | "dummy";
  items: IList<IToken>;
  children: IList<IJoinNode>;
  allChildren: IList<IReteNode>;
}

export function makeBetaMemoryNode(): IBetaMemoryNode {
  const bm: IBetaMemoryNode = Object.create(null);

  bm.type = "beta-memory";
  bm.items = null;
  bm.children = null;
  bm.allChildren = null;

  return bm;
}

export function betaMemoryNodeLeftActivation(
  node: IBetaMemoryNode,
  t: IToken,
  f: IFact | null,
): void {
  const newToken = makeToken(node, t, f);

  // Only insert unique.
  if (!node.items || node.items.every(i => !compareTokens(i, newToken))) {
    node.items = addToListHead(node.items, newToken);

    forEachList(
      child => runLeftActivationOnNode(child, newToken, f),
      node.children,
    );
  }
}

export function buildOrShareBetaMemoryNode(parent: IReteNode): IBetaMemoryNode {
  const foundChild = findList(c => c.type === "beta-memory", parent.children);
  if (foundChild) {
    return foundChild as IBetaMemoryNode;
  }

  const bm = makeBetaMemoryNode();
  bm.parent = parent;

  parent.children = addToListHead(parent.children, bm);

  updateNewNodeWithMatchesFromAbove(bm);

  return bm;
}
