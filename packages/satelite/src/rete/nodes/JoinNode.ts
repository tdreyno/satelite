import { IFact, IFactFields } from "../Fact";
import { compareTokens, IToken, makeToken } from "../Token";
import {
  addToListHead,
  IList,
  removeFromList,
  runLeftActivateOnNodes,
  runLeftRetractOnNodes,
  uniqueInList,
  updateNewNodeWithMatchesFromAbove,
} from "../util";
import { IAlphaMemoryNode } from "./AlphaMemoryNode";
import { IReteNode } from "./ReteNode";

export interface ITestAtJoinNode {
  fieldArg1: IFactFields;
  conditionNumberOfArg2: number;
  fieldArg2: IFactFields;
}

export function makeTestAtJoinNode(
  fieldArg1: IFactFields,
  conditionNumberOfArg2: number,
  fieldArg2: IFactFields,
): ITestAtJoinNode {
  const tajn: ITestAtJoinNode = Object.create(null);

  tajn.fieldArg1 = fieldArg1;
  tajn.conditionNumberOfArg2 = conditionNumberOfArg2;
  tajn.fieldArg2 = fieldArg2;

  return tajn;
}

export function performJoinTests(
  tests: IList<ITestAtJoinNode>,
  t: IToken,
  f: IFact,
): boolean {
  if (!tests) {
    return true;
  }

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const arg1 = f[test.fieldArg1];

    if (t.fact) {
      const arg2 = t.fact[test.fieldArg2];

      // TODO: Make this comparison any predicate
      if (arg1 !== arg2) {
        return false;
      }
    }
  }

  return true;
}

export interface IJoinNode extends IReteNode {
  type: "join";
  parent: IReteNode;
  items: IList<IToken>;
  alphaMemory: IAlphaMemoryNode;
  tests: IList<ITestAtJoinNode>;
}

export function makeJoinNode(
  parent: IReteNode,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): IJoinNode {
  const node: IJoinNode = Object.create(null);

  node.type = "join";
  node.parent = parent;
  node.items = null;
  node.alphaMemory = alphaMemory;
  node.tests = tests;

  node.children = null;

  return node;
}

export function joinNodeLeftActivate(node: IJoinNode, t: IToken): void {
  if (!uniqueInList(node.items, t, compareTokens)) {
    return;
  }

  node.items = addToListHead(node.items, t);

  if (node.alphaMemory.facts) {
    for (let i = 0; i < node.alphaMemory.facts.length; i++) {
      const fact = node.alphaMemory.facts[i];

      if (performJoinTests(node.tests, t, fact)) {
        const newToken = makeToken(node, t, fact);
        runLeftActivateOnNodes(node.children, newToken);
      }
    }
  }
}

export function joinNodeLeftRetract(node: IJoinNode, t: IToken): void {
  if (uniqueInList(node.items, t, compareTokens)) {
    return;
  }

  node.items = removeFromList(node.items, t);

  if (node.alphaMemory.facts) {
    for (let i = 0; i < node.alphaMemory.facts.length; i++) {
      const fact = node.alphaMemory.facts[i];

      if (performJoinTests(node.tests, t, fact)) {
        const newToken = makeToken(node, t, fact);
        runLeftRetractOnNodes(node.children, newToken);
      }
    }
  }
}

function executeRight(
  node: IJoinNode,
  f: IFact,
  action: (children: IList<IReteNode>, t: IToken) => void,
) {
  if (node.items) {
    for (let i = 0; i < node.items.length; i++) {
      const token = node.items[i];

      if (performJoinTests(node.tests, token, f)) {
        const newToken = makeToken(node, token, f);

        action(node.children, newToken);
      }
    }
  }
}

export function joinNodeRightRetract(node: IJoinNode, f: IFact): void {
  executeRight(node, f, runLeftRetractOnNodes);
}

export function joinNodeRightActivate(node: IJoinNode, f: IFact): void {
  executeRight(node, f, runLeftActivateOnNodes);
}

export function buildOrShareJoinNode(
  parent: IReteNode,
  alphaMemory: IAlphaMemoryNode,
  tests: IList<ITestAtJoinNode>,
): IJoinNode {
  const node = makeJoinNode(parent, alphaMemory, tests);

  parent.children = addToListHead(parent.children, node);
  alphaMemory.successors = addToListHead(alphaMemory.successors, node);

  updateNewNodeWithMatchesFromAbove(node);

  return node;
}
