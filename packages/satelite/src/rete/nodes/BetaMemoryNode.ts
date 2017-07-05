import { IFact } from "../Fact";
import { compareTokens, IToken, makeToken } from "../Token";
import {
  addToListHead,
  IList,
  runLeftActivateOnNode,
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
  if (node.items) {
    for (let i = 0; i < node.items.length; i++) {
      if (compareTokens(node.items[i], newToken)) {
        return;
      }
    }
  }

  node.items = addToListHead(node.items, newToken);

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      runLeftActivateOnNode(child, newToken, f);
    }
  }
}

function findBetaMemoryChildren(
  children: IList<IReteNode>,
): IReteNode | undefined {
  if (!children) {
    return;
  }

  for (let i = 0; i < children.length; i++) {
    if (children[i].type === "beta-memory") {
      return children[i];
    }
  }
}

export function buildOrShareBetaMemoryNode(parent: IReteNode): IBetaMemoryNode {
  const foundChild = findBetaMemoryChildren(parent.children);

  if (foundChild) {
    return foundChild as IBetaMemoryNode;
  }

  const bm = makeBetaMemoryNode();
  bm.parent = parent;

  parent.children = addToListHead(parent.children, bm);

  updateNewNodeWithMatchesFromAbove(bm);

  return bm;
}
