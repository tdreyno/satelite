import { IFact } from "../Fact";
import {
  compareTokens,
  deleteDescendentsOfToken,
  IToken,
  makeToken,
} from "../Token";
import { addToListHead, IList, runLeftActivationOnNode } from "../util";
import { IAlphaMemoryNode } from "./AlphaMemoryNode";
import { ITestAtJoinNode, performJoinTests } from "./JoinNode";
import { IReteNode } from "./ReteNode";

export interface INegativeNode extends IReteNode {
  type: "negative";
  items: IList<IToken>;
  alphaMemory: IAlphaMemoryNode;
  tests: IList<ITestAtJoinNode>;
}

export interface INegativeJoinResult {
  owner: IToken;
  fact: IFact;
}

export function makeNegativeJoinResult(
  owner: IToken,
  fact: IFact,
): INegativeJoinResult {
  const njr = Object.create(null);

  njr.owner = owner;
  njr.fact = fact;

  return njr;
}

export function negativeNodeLeftActivation(
  node: INegativeNode,
  t: IToken,
  f: IFact | null,
): void {
  const newToken = makeToken(node, t, f);

  // Only insert unique.
  if (!node.items || node.items.every(i => !compareTokens(i, newToken))) {
    node.items = addToListHead(node.items, newToken);

    if (f && node.alphaMemory.items) {
      for (const item of node.alphaMemory.items) {
        if (performJoinTests(node.tests, newToken, item.fact)) {
          const jr = makeNegativeJoinResult(newToken, f);
          newToken.joinResults = addToListHead(newToken.joinResults, jr);
          f.negativeJoinResults = addToListHead(f.negativeJoinResults, jr);
        }
      }
    }

    if (!newToken.joinResults && node.children) {
      for (const child of node.children) {
        runLeftActivationOnNode(child, newToken, null);
      }
    }
  }
}

export function negativeNodeRightActivation(
  node: INegativeNode,
  f: IFact,
): void {
  if (node.items) {
    for (const t of node.items) {
      if (performJoinTests(node.tests, t, f)) {
        if (!t.joinResults) {
          deleteDescendentsOfToken(t);
        }

        const jr = makeNegativeJoinResult(t, f);
        t.joinResults = addToListHead(t.joinResults, jr);
        f.negativeJoinResults = addToListHead(f.negativeJoinResults, jr);
      }
    }
  }
}
