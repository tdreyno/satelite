import { IFact, IFactFields } from "../Fact";
import { compareTokens, IToken, makeToken } from "../Token";
import {
  addToListHead,
  findInList,
  IList,
  removeIndexFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
  updateNewNodeWithMatchesFromAbove,
} from "../util";
import { IAlphaMemoryNode } from "./AlphaMemoryNode";
import { ITestAtJoinNode, performJoinTests } from "./JoinNode";
import { IReteNode } from "./ReteNode";

export interface INegativeNode extends IReteNode {
  type: "negative";
  parent: IReteNode;
  items: IList<IToken>;
  alphaMemory: IAlphaMemoryNode;
  tests: IList<ITestAtJoinNode>;
}

export function makeNegativeNode(
  parent: IReteNode,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): INegativeNode {
  const node: INegativeNode = Object.create(null);

  node.type = "negative";
  node.parent = parent;
  node.items = null;
  node.alphaMemory = alphaMemory;
  node.tests = tests;

  node.children = null;

  return node;
}

export function executeLeft(
  node: INegativeNode,
  t: IToken,
  action: (children: IList<IReteNode>, t: IToken) => void,
) {
  let didMatch = false;

  if (node.alphaMemory.facts) {
    for (let i = 0; i < node.alphaMemory.facts.length; i++) {
      const fact = node.alphaMemory.facts[i];

      if (performJoinTests(node.tests, t, fact)) {
        didMatch = true;
        break;
      }
    }
  }

  if (!didMatch) {
    action(node.children, t);
  }
}

export function negativeNodeLeftActivate(node: INegativeNode, t: IToken): void {
  if (findInList(node.items, t, compareTokens) !== -1) {
    return;
  }

  node.items = addToListHead(node.items, t);

  executeLeft(node, t, runLeftActivateOnNodes);
}

export function negativeNodeLeftRetract(node: INegativeNode, t: IToken): void {
  const foundIndex = findInList(node.items, t, compareTokens);

  if (foundIndex === -1) {
    return;
  }

  node.items = removeIndexFromList(node.items, foundIndex);

  executeLeft(node, t, runLeftRetractOnNodes);
}

export function executeRight(
  node: INegativeNode,
  f: IFact,
  action: (children: IList<IReteNode>, f: IToken) => void,
) {
  if (node.items) {
    for (let i = 0; i < node.items.length; i++) {
      const t = node.items[i];

      if (!performJoinTests(node.tests, t, f)) {
        action(node.children, t);
        continue;
      }
    }
  }
}

export function negativeNodeRightRetract(node: INegativeNode, f: IFact): void {
  executeRight(node, f, runLeftRetractOnNodes);
}

export function negativeNodeRightActivate(node: INegativeNode, f: IFact): void {
  executeRight(node, f, runLeftActivateOnNodes);
}

export function buildOrShareNegativeNode(
  parent: IReteNode,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): INegativeNode {
  const node = makeNegativeNode(parent, alphaMemory, tests);

  parent.children = addToListHead(parent.children, node);
  alphaMemory.successors = addToListHead(alphaMemory.successors, node);

  updateNewNodeWithMatchesFromAbove(node);

  return node;
}
